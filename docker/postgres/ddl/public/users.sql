create table users
(
    id    serial
        primary key,
    name  varchar(255),
    email varchar(255)
);

alter table users
    owner to balazs;

