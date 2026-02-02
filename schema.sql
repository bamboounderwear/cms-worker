drop table if exists users;
drop table if exists sessions;
drop table if exists documents;
drop table if exists cache;

create table users (
    email text primary key,
    key text,
    verification text,
    verification_expires_at number
) without rowid;
create unique index users_key on users (key);
insert into users (email, verification, verification_expires_at) values ('admin@example.com', '1234', 2000000000);

create table sessions (
    key text primary key,
    email text,
    expires_at integer
) without rowid;

create table documents (
    model text,
    name text,
    value text,
    modified_at integer,
    modified_by text,
    primary key (model, name)
);

insert into documents (model, name, value, modified_at, modified_by)
values
    (
        'pages',
        'home',
        '{"title":"Home","description":"Welcome to the public site.","content":"# Welcome\\nThis is your starter home page.\\n\\n- Edit this page in the CMS.\\n- Publish to update the public site.","status":"published"}',
        1700000000,
        'seed'
    ),
    (
        'pages',
        'about',
        '{"title":"About","description":"Learn more about this site.","content":"# About\\nShare your story here and keep it up to date in the CMS.","status":"published"}',
        1700000000,
        'seed'
    );

create table cache (
    key text primary key,
    value text
);
