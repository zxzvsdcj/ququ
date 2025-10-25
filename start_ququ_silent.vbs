Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
cdCommand = "cd /d " & Chr(34) & scriptPath & Chr(34)

' 启动应用，隐藏命令行窗口
WshShell.Run "cmd /c " & cdCommand & " && pnpm run dev", 0, False

' 静默启动，不显示任何弹窗
' 应用启动后会自动在系统托盘中显示图标