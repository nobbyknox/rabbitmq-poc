# Rabbit MQ

## Installation

### Create User

Create an admin user with password "admin":

```
$ rabbitmqctl add_user admin admin
$ rabbitmqctl set_user_tags admin administrator
$ rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"
```

### Enable Management Interface

[See this helpful post on Stack Overflow](https://stackoverflow.com/questions/22850546/cant-access-rabbitmq-web-management-interface-after-fresh-install)

```
$ ./rabbitmq-plugins enable rabbitmq_management
```

Access the management interface here:

http://127.0.0.1:15672/
