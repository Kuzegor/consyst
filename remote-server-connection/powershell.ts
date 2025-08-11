import {exec, spawn} from 'child_process'

import { resolve } from 'path/posix';

import { CredentialsModel } from './server/credentials.model';

import { SessionModel } from './server/session.model';

 

export function runPowerShellCommand(command: string) {

    return new Promise<string>((resolve, reject) => {

        exec(`chcp 65001 | C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -Command "${command}"`, (error, stdout, stderr) => {

        //exec(`echo '$j4HoDocvhSwX' | sudo -S /opt/powershell/pwsh -Command "${command}"`, (error, stdout, stderr) => {

            if (error) {

                return reject(`Error: ${error.message}`);

            }

            if (stderr) {

                return reject(`STDERR: ${stderr}`);

            }

            resolve(stdout);

        });

    });

}

 

//Õ≈ƒŒ–¿¡Œ“¿ÕÕ¿ﬂ ¿À‹“≈–Õ¿“»¬¿

export async function getSessionInfoProps(credentials: CredentialsModel){

    const command = `Invoke-Command -ComputerName '${credentials.ServerFullName}' -Credential (New-Object System.Management.Automation.PSCredential('${credentials.Domain+'\\'+credentials.Login}', (ConvertTo-SecureString '${credentials.Password}' -AsPlainText -Force))) -ScriptBlock { Get-Process -IncludeUserName | Select-Object UserName,SessionId,StartTime,IdleTime | Where-Object { $_.UserName -ne $null -and $_.UserName.StartsWith('${credentials.Domain.toUpperCase()}') } | Sort-Object SessionId -Unique } | Select-Object UserName,SessionId,StartTime,IdleTime`;

    const consoleOutput = await runPowerShellCommand(command);

    return consoleOutput;

}