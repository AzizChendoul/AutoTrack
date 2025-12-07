@echo off
REM Generation des fichiers CORBA
idlj -fall autotrack.idl

REM Compilation
javac autotrack\*.java CorbaServer.java CorbaClient.java

echo.
echo Si des erreurs apparaissent ci-dessus (comme 'idlj' non reconnu),
echo c'est que votre version de Java ne supporte plus CORBA nativement (Java 8 requis).
echo.
pause