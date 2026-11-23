
# running config server - port 8888

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\config-server\target\config-server-0.0.1-SNAPSHOT.jar"

# running eureka server - port 8761

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar"

# running Etablissement Service — port 8081

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\etablissement-service\target\etablissement-service-0.0.1-SNAPSHOT.jar"

# running Formation Service — port 8082 

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\formation-service\target\formation-service-0.0.1-SNAPSHOT.jar"


# running Finance Service — port 8083 

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\finance-service\target\finance-service-0.0.1-SNAPSHOT.jar"


# running Notification Service — port 8084 

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\notification-service\target\notification-service-0.0.1-SNAPSHOT.jar"

# running API Gateway — port 8080

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot"; $env:Path="$env:JAVA_HOME\bin;$env:Path"; java -jar ".\educenter-backend\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar"
