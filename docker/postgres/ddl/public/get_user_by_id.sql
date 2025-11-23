create function get_user_by_id(user_id integer)
    returns TABLE(id integer, name character varying, email character varying)
    language plpgsql
as
$$
BEGIN
    RETURN QUERY
        SELECT u.id, u.name, u.email
        FROM users u
        WHERE u.id = user_id or user_id = -1;
END;
$$;

alter function get_user_by_id(integer) owner to balazs;

