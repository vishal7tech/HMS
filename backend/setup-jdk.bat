@echo off
echo Setting up JDK for IntelliJ IDEA...
echo.

REM Set JAVA_HOME to JDK 17
set JAVA_HOME=C:\Program Files\Java\jdk-24
echo JAVA_HOME set to: %JAVA_HOME%

REM Add to PATH
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo JDK Configuration Complete!
echo Java version:
java -version

echo.
echo Please restart IntelliJ IDEA and reload the project.
echo The JDK error should now be resolved.
pause
