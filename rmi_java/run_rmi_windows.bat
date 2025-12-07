@echo off
cd rmi_java
javac *.java
start rmiregistry 1099
timeout /t 2 >nul
start cmd /k "java RmiServer"
timeout /t 1 >nul
start cmd /k "java RmiClient"
