@echo off
SETLOCAL EnableDelayedExpansion

set /p version=Enter version name: 
del .\build\!version!
mkdir .\build\!version!

echo Compiling Stylus-lang stylesheets
start /WAIT /b stylus pagemod/css/darkmode
echo Creating files for Firefox
mkdir .\build\!version!\firefox
robocopy .\ .\build\!version!\firefox\ /s /e /xd "build" ".git" /xf ".gitignore" "create.bat"
del .\build\!version!\firefox\manifest_chrome.json
rem Powershell Compress-Archive -Path .\build\!version!\firefox\* -DestinationPath .\build\!version!\niconico-peppermint.zip
rename .\build\!version!\niconico-peppermint.zip niconico-peppermint.xpi
echo Creating files for Chromium
mkdir .\build\!version!\chrome
robocopy .\ .\build\!version!\chrome\ /s /e /xd "build" ".git" /xf ".gitignore" "create.bat"
del .\build\!version!\chrome\manifest.json
rename .\build\!version!\chrome\manifest_chrome.json manifest.json
rem Powershell Compress-Archive -Path .\build\!version!\chrome\ -DestinationPath .\build\!version!\niconico-peppermint-chrome.zip
echo Done
pause