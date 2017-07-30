# Rabbit MQ

## Installation

### RabbitMQ

```
$ sudo apt-get update
$ sudo apt-get install rabbitmq-server
```

### Create User

Create an admin user with password "admin":

```
$ sudo rabbitmqctl add_user admin admin
$ sudo rabbitmqctl set_user_tags admin administrator
$ sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

### Enable Management Interface

[See this helpful post on Stack Overflow](https://stackoverflow.com/questions/22850546/cant-access-rabbitmq-web-management-interface-after-fresh-install)

```
$ ./rabbitmq-plugins enable rabbitmq_management
```

Access the management interface here:

http://127.0.0.1:15672/
