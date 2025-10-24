Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
scriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
cdCommand = "cd /d " & Chr(34) & scriptPath & Chr(34)

' 启动应用，隐藏命令行窗口
WshShell.Run "cmd /c " & cdCommand & " && pnpm run dev", 0, False

' 等待一下确保应用启动
WScript.Sleep 2000

' 可选：显示启动状态
MsgBox "蛐蛐应用已启动！" & vbCrLf & vbCrLf & "提示：应用在后台运行，请查看系统托盘图标。", vbInformation, "蛐蛐启动器"
