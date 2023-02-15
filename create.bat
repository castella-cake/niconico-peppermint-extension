@echo off
SETLOCAL EnableDelayedExpansion

set /p version=バージョン名を入力: 
del .\build\!version!
mkdir .\build\!version!

echo Firefox用のフォルダーを作成中...
mkdir .\build\!version!\firefox
robocopy .\ .\build\!version!\firefox\ /s /e /xd "build" ".git" /xf ".gitignore" "create.bat"
del .\build\!version!\firefox\manifest_chrome.json
rem Powershell Compress-Archive -Path .\build\!version!\firefox\* -DestinationPath .\build\!version!\niconico-peppermint.zip
rename .\build\!version!\niconico-peppermint.zip niconico-peppermint.xpi
echo Chrome用のファイルを作成中...
mkdir .\build\!version!\chrome
robocopy .\ .\build\!version!\chrome\ /s /e /xd "build" ".git" /xf ".gitignore" "create.bat"
del .\build\!version!\chrome\manifest.json
rename .\build\!version!\chrome\manifest_chrome.json manifest.json
rem Powershell Compress-Archive -Path .\build\!version!\chrome\ -DestinationPath .\build\!version!\niconico-peppermint-chrome.zip
echo completed!
pause