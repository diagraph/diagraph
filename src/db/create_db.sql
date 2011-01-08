
-- visio online database
drop database if exists visio_online;
create database visio_online default character set utf8 collate utf8_unicode_ci;
use visio_online;

-- visio online tables
create table base (
	db_version integer not null primary key default 1
);
insert into base values (default);

create table users (
	id integer not null primary key auto_increment,
	name varchar(32) unique not null,
	email varchar(128) unique not null, -- 128 chars have to suffice for now
	password varchar(128) not null, -- SHA512
	type integer not null check (type between 0 and 1) -- 0: root, 1: user
);

create table categories (
	id integer not null primary key auto_increment,
	name tinytext not null
);

create table objects (
	id integer not null primary key auto_increment,
	category integer not null references categories(id) on delete cascade,
	name tinytext not null,
	data tinytext not null -- TODO: svg image? sth else?
);

create table documents (
	id integer not null primary key auto_increment,
	author integer not null references users(id) on delete cascade,
	name tinytext not null,
	creation_date timestamp default now(),
	modification_date timestamp default 0 -- TODO: write procedure to update this on snapshots change
);

create table snapshots (
	id integer not null primary key auto_increment,
	document integer not null references documents(id) on delete cascade,
	creation_date timestamp default now(),
	data text not null
);

-- data for debugging purposes
insert into users values (default, "root", "root@localhost", '3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1eb8b85103e3be7ba613b31bb5c9c36214dc9f14a42fd7a2fdb84856bca5c44c2', 0); -- pw == "123"

insert into documents values (default, 1, "test doc", default, default);
insert into snapshots values (default, 1, default, "");

insert into categories values (default, "Basics");
insert into objects values (default, 1, "Rectangle", "rect");
insert into objects values (default, 1, "Circle", "circle");

