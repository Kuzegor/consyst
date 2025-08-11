import { Injectable, HttpException, HttpStatus, ConsoleLogger } from '@nestjs/common';

import { SessionModel } from './session.model';

import { CredentialsModel } from './credentials.model';

import { NodeSSH, SSHError } from 'node-ssh';

import { runPowerShellCommand } from 'src/powershell';

import { ServerModel } from 'src/db/serverList/server.model';

import { ServerListService } from 'src/db/serverList/serverList.service';

import { ServerGroupsService } from 'src/db/serverGroups/serverGroups.service';

import { ServerGroupModel } from 'src/db/serverGroups/serverGroup,model';

import { OperatingSystem } from 'src/enums/OperatingSystem';

import { createCipheriv, randomBytes, createDecipheriv, scrypt } from 'crypto';

import { promisify } from 'util';

import { decrypt } from 'src/crypto';

 

@Injectable()

export class ServerService {

    constructor(

        private readonly serverListService: ServerListService, private readonly serverGroupsService: ServerGroupsService

    ) {}

 

    getCredentials(server: ServerModel){        

        const name: string = server.serverName.split('.')[0];

        const domain: string = server.serverName.split('.')[1];

        const credentials: CredentialsModel = new CredentialsModel();

        credentials.ServerId = server.serverId;

        credentials.ServerFullName = server.serverName;

        credentials.Domain = domain;

        credentials.OperatingSystem = server.operatingSystem;

 

        const encnode = '1a01297033f78d0dc6055e9ff82ef58e'

        const encpsql = 'a3553adf3f87fc4a727598cbdbc88f40'

        const encknpp = '589824656b1d63a3f9cdf8be5a08a420d87d4ee6e75a858921663f6095740747';

        const encklnnpp = 'b8a5787d991fb17c201f21b95909c6f0'

 

        switch(name){

            case 'kln-node':

                credentials.Login = 'nodeuser';

                credentials.Password = decrypt(encnode);

                break;

            case 'srv-psql-test':

                credentials.Login = 'psql-test-admin';

                credentials.Password = decrypt(encpsql);

                break;

            default:

                switch (domain){

                    case 'knpp':

                        credentials.Login = 'remoteSessionsMon';

                        credentials.Password = decrypt(encknpp);

                        break;

                    case 'klnnpp':

                        credentials.Login = 'kscp_service';

                        credentials.Password = decrypt(encklnnpp);

                        break;

                    default:

                        console.log('Íåèçâåñòûé ñåðâåð èëè äîìåí');

                }

        }

        return credentials;

    }

 

    async getWindowsSessions(credentials: CredentialsModel){

       

        try{

            //windows:

            const consoleOutput = await runPowerShellCommand(`Invoke-Command -ComputerName '${credentials.ServerFullName}' -Credential (New-Object System.Management.Automation.PSCredential('${credentials.Domain+'\\'+credentials.Login}', (ConvertTo-SecureString '${credentials.Password}' -AsPlainText -Force))) -ScriptBlock { $queryUserOutput = query user | Out-String; $from = [System.Text.Encoding]::GetEncoding('cp866'); $to = [System.Text.Encoding]::GetEncoding('windows-1251'); $bytes = [System.Text.Encoding]::Convert($from, $to, $to.GetBytes($queryUserOutput)); [System.Text.Encoding]::GetEncoding('windows-1251').GetString($bytes) }`);

            //linux:

            //const consoleOutput = await runPowerShellCommand(`\\$session = New-PSSession -ComputerName ${credentials.ServerFullName} -Credential (New-Object System.Management.Automation.PSCredential('${credentials.Domain}\\${credentials.Login}', (ConvertTo-SecureString '${credentials.Password}' -AsPlainText -Force))) -UseSSL Invoke-Command -Session \\$session -ScriptBlock { \\$queryUserOutput = query user | Out-String; \\$from = [System.Text.Encoding]::GetEncoding('cp866'); \\$to = [System.Text.Encoding]::GetEncoding('windows-1251'); \\$bytes = [System.Text.Encoding]::Convert(\\$from, \\$to, \\$to.GetBytes($queryUserOutput)); [System.Text.Encoding]::GetEncoding('windows-1251').GetString($bytes) }`);

            //const consoleOutput = await runPowerShellCommand(`Invoke-Command -ComputerName '${credentials.ServerFullName}' -Credential (New-Object System.Management.Automation.PSCredential('${credentials.Domain+'\\'+credentials.Login}', (ConvertTo-SecureString '${credentials.Password}' -AsPlainText -Force))) -ScriptBlock { \\$queryUserOutput = query user | Out-String; \\$from = [System.Text.Encoding]::GetEncoding('cp866'); \\$to = [System.Text.Encoding]::GetEncoding('windows-1251'); \\$bytes = [System.Text.Encoding]::Convert(\\$from, \\$to, \\$to.GetBytes($queryUserOutput)); [System.Text.Encoding]::GetEncoding('windows-1251').GetString(\\$bytes) }`);

 

            const sessionModels: SessionModel[] = [];

            const rows: string[] = consoleOutput.split('\n');                        

            for(let i = 1; i < rows.length; i++){

                const sessId = rows[i].substring(23,44).trim().split('').reverse().join('').split(' ');

                const sessionModel: SessionModel = {

                    ServerId: credentials.ServerId,

                    SessionId: sessId[0].split('').reverse().join(''),

                    UserName: rows[i].substring(0,23).trim(),

                    ConnectTime: rows[i].substring(65,rows[i].length).trim(),

                    IdleTime: rows[i].substring(55,65).trim(),

                    ConnectionState: rows[i].substring(44,55).trim()

                }

   

                if(Number(sessionModel.SessionId)>0)

                sessionModels.push(sessionModel);

            }

            return sessionModels;

        } catch(err){

            console.log('Error in getWindowsSessions(): '+err);

            throw new HttpException("Îøèáêà âûïîëíåíèÿ PowerShell êîìàíäû",HttpStatus.BAD_REQUEST);

        }

    }

 

    async getLinuxSessions(credentials: CredentialsModel){

        const ssh = new NodeSSH();

        try{

            await ssh.connect({

                host: credentials.ServerFullName,

                username: credentials.Login,

                password: credentials.Password

            });

        } catch(err){

            console.log('Error connecting to Linux server: '+err);

            throw new HttpException("Îøèáêà ïîäêëþ÷åíèÿ ê Linux ñåðâåðó",HttpStatus.BAD_REQUEST);

        }

 

        const {stdout: allSessionsOutput, stderr: error} = await ssh.execCommand(`loginctl list-sessions`);

        if(error){

            console.log('Error executing Linux terminal command: '+error);

            throw new HttpException("Îøèáêà âûïîëíåíèÿ Linux êîìàíäû",HttpStatus.BAD_REQUEST);

        }  

 

        const sessionModels: SessionModel[] = [];

        const rows: string[] = allSessionsOutput.split('\n');

        for(let i = 1; i < rows.length-2; i ++){  

            const sessionId = rows[i].trim().split(' ')[0].trim();

 

            const {stdout: sessionOutput, stderr: error} = await ssh.execCommand(`loginctl show-session ${sessionId} | awk -F= '/Id=|Name=|Timestamp=|State=|IdleSinceHint=/ {print$2}'`);

            if(error){

                console.log('Error executing Linux terminal command: '+error);

                throw new HttpException("Îøèáêà âûïîëíåíèÿ Linux êîìàíäû",HttpStatus.BAD_REQUEST);

            }

 

            const props: string[] = sessionOutput.split('\n');

            const sessionModel: SessionModel = {

                ServerId: credentials.ServerId,

                SessionId: props[0],

                UserName: props[1],

                ConnectTime: props[2],                    

                ConnectionState: props[3],

                IdleTime: props[4]

            }

 

            if(sessionModel.UserName!='fly-dm')

            sessionModels.push(sessionModel);

        }        

        ssh.dispose();                

        return sessionModels;

    }

 

    async getByServerId(serverId: number){

        console.log('url serverId: '+serverId);

        if(!serverId) return null;

 

        const server = await this.serverListService.getById(serverId);

        if(!server) return null;

 

        const credentials = this.getCredentials(server);

 

        if(credentials.OperatingSystem === OperatingSystem.Windows){

            try{

                return await this.getWindowsSessions(credentials);

            } catch(err){

                console.log(err);

            }

           

        } else if(credentials.OperatingSystem === OperatingSystem.Linux){

            try{

                return await this.getLinuxSessions(credentials);

            } catch(err){

                console.log(err);

            }            

        }

    }

 

    //ÎÁÍÎÂËßÅÒ ÄÀÍÍÛÅ Î ÑÅÐÂÅÐÀÕ ÎÄÍÎÉ ÃÐÓÏÏÛ

    async getAllInGroup(serverId: number){

        const targetServer = await this.serverListService.getById(serverId);

        const serverList: ServerModel[] = await this.serverListService.getAll();  

        const serverListFiltered = serverList.filter((server)=>server.serverGroup===targetServer?.serverGroup);

 

        //PROMISES

        const serverSessionPromises = serverListFiltered.map(async (server)=>{

            try{

                const sessionModels = await this.getByServerId(server.serverId);

                return sessionModels?.length ? sessionModels : null;

            } catch(err){

                console.log('Îøèáêà ïîëó÷åíèÿ ñåññèé c '+server.serverName+' '+err);      

                return null;

            }            

        });

 

        //RESOLVE ALL PROMISES ASYNCHRONOUSLY

        const serverSessionModels = await Promise.all(serverSessionPromises);

        console.log(serverSessionModels);

        return serverSessionModels.filter(server => server && server.length>0);

    }

 

    async getAll(){

        const serverGroups: ServerGroupModel[] = await this.serverGroupsService.getAll();

        const serverList: ServerModel[] = await this.serverListService.getAll();        

 

        //PROMISES

        const serverSessionPromises = serverList.map(async (server)=>{

            const group = serverGroups.find(group => group.groupId === server.serverGroup);

            if(group){

                try{

                    const sessionModels = await this.getByServerId(server.serverId);

                    return sessionModels?.length ? sessionModels : null;

                } catch(err){

                    console.log('Îøèáêà ïîëó÷åíèÿ ñåññèé c '+server.serverName+' '+err);      

                    return null;              

                }

            }

            return null;

        });

 

        //RESOLVE ALL PROMISES ASYNCHRONOUSLY

        const serverSessionModels = await Promise.all(serverSessionPromises);

 

        //ÂÎÇÂÐÀÙÀÅÌÛÉ ÌÀÑÑÈÂ ÑÅÑÑÈÉ, ÑÃÐÓÏÏÈÐÎÂÀÍÍÛÕ ÏÎ ÑÅÐÂÅÐÀÌ È ÃÐÓÏÏÀÌ ÑÅÐÂÅÐÎÂ - Â ÊÀÆÄÎÉ ÃÐÓÏÏE ÅÑÒÜ ÑÅÐÂÅÐÀ - ÍÀ ÊÀÆÄÎÌ ÑÅÐÂÅÐÅ ÑÅÑÑÈÈ

        const groupSessionModels: SessionModel[][][] = [];

        serverSessionModels.forEach((serverSessionModel, index)=>{

            if(serverSessionModel&&serverSessionModel.length>0){

                const groupIndex = serverList[index].serverGroup;

                if(!groupSessionModels[groupIndex]){

                    groupSessionModels[groupIndex] = [];

                }

                groupSessionModels[groupIndex].push(serverSessionModel);

            }

        });

        return groupSessionModels.filter(group => group && group.length>0);

    }

 

    async logoffWindowsUser(credentials: CredentialsModel, sessionId: string){

        try{

            await runPowerShellCommand(`Invoke-Command -ComputerName '${credentials.ServerFullName}' -Credential (New-Object System.Management.Automation.PSCredential('${credentials.Domain+'\\'+credentials.Login}', (ConvertTo-SecureString '${credentials.Password}' -AsPlainText -Force))) -ScriptBlock { $queryUserOutput = logoff ${sessionId} | Out-String; $from = [System.Text.Encoding]::GetEncoding('cp866'); $to = [System.Text.Encoding]::GetEncoding('windows-1251'); $bytes = [System.Text.Encoding]::Convert($from, $to, $to.GetBytes($queryUserOutput)); [System.Text.Encoding]::GetEncoding('windows-1251').GetString($bytes) }`);

        }catch(err){

            console.log(err);

            return false;

        }

        return true;

    }

 

    async logoffLinuxUser(credentials: CredentialsModel, sessionId: string){

        const ssh = new NodeSSH();

        try{

            await ssh.connect({

                host: credentials.ServerFullName,

                username: credentials.Login,

                password: credentials.Password

            });

        } catch(err){

            console.log('Error connecting to Linux server: '+err);

            return false;

        }

 

        const {stdout, stderr: error} = await ssh.execCommand(`echo '${credentials.Password}' | sudo -S loginctl terminate-session ${sessionId}`)

        if(error){

            console.log('Error executing Linux terminal command: '+error);

            ssh.dispose();      

            return false;

        }

 

        ssh.dispose();      

        return true;

    }

 

    async logoffById(serverId: number, sessionId: string){

        console.log('url serverId: '+serverId);

        if(!serverId) return null;

 

        const server = await this.serverListService.getById(serverId);

        if(!server) return null;

 

        const credentials = this.getCredentials(server);

 

        if(credentials.OperatingSystem == OperatingSystem.Windows){

            return await this.logoffWindowsUser(credentials,sessionId);

        } else if(credentials.OperatingSystem == OperatingSystem.Linux){

            return await this.logoffLinuxUser(credentials,sessionId);

        }

    }

}