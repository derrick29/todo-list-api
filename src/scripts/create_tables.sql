drop table if exists todoitems;
drop table if exists todos;
drop table if exists todosusers;


create table todosusers (
	user_id int generated always as identity,
	username varchar(50) not null,
	password varchar(255) not null,
	primary key(user_id),
	unique(username)
);

create table todos (
	todo_id int generated always as identity,
	todo_title varchar(50),
	user_id int,
	primary key(todo_id),
	constraint fk_todo foreign key (user_id) references todosusers(user_id)
);

create table todoitems (
	todo_item_id int generated always as identity,
	todo_id int,
	todo_item_title varchar(50) not null,
	is_done boolean,
	primary key(todo_item_id),
	constraint fk_todo_item foreign key (todo_id) references todos(todo_id) on delete cascade
);