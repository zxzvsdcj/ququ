Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)

' 创建桌面快捷方式
desktopPath = WshShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\蛐蛐.lnk"

Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = scriptPath & "\start_ququ_silent.vbs"
shortcut.WorkingDirectory = scriptPath
shortcut.Description = "蛐蛐 - 智能语音转文字应用"
shortcut.IconLocation = scriptPath & "\assets\icon.ico"
shortcut.Save

MsgBox "桌面快捷方式已创建！" & vbCrLf & vbCrLf & "现在你可以双击桌面上的"蛐蛐"图标来启动应用。", vbInformation, "快捷方式创建成功"
