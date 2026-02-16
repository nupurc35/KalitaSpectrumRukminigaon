CREATE OR REPLACE FUNCTION get_crm_metrics(res_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    start_of_day timestamp;
    today_date date;
    yesterday_iso timestamp;
    
    new_leads_today int;
    contacted_today int;
    reservations_created int;
    completed_reservations int;
    overdue_follow_ups int;
    follow_ups_due_today int;
    never_contacted_24h int;
    
    result json;
BEGIN
    -- Set time variables
    start_of_day := date_trunc('day', now());
    today_date := current_date;
    yesterday_iso := now() - interval '1 day';

    -- 1. New Leads Today
    SELECT count(*) INTO new_leads_today
    FROM leads
    WHERE restaurant_id = res_id
    AND created_at >= start_of_day;

    -- 2. Contacted Today (Unique Leads)
    SELECT count(DISTINCT lead_id) INTO contacted_today
    FROM lead_events le
    JOIN leads l ON le.lead_id = l.id
    WHERE l.restaurant_id = res_id
    AND le.event_type = 'contacted'
    AND le.created_at >= start_of_day;

    -- 3. Reservations Created Today
    SELECT count(*) INTO reservations_created
    FROM reservations
    WHERE restaurant_id = res_id
    AND created_at >= start_of_day;

    -- 4. Completed Reservations Today
    SELECT count(*) INTO completed_reservations
    FROM reservations
    WHERE restaurant_id = res_id
    AND status = 'completed'
    AND date = today_date;

    -- 5. Overdue Follow-ups
    SELECT count(*) INTO overdue_follow_ups
    FROM leads
    WHERE restaurant_id = res_id
    AND next_follow_up < today_date
    AND status NOT IN ('completed', 'lost');

    -- 6. Follow-ups Due Today
    SELECT count(*) INTO follow_ups_due_today
    FROM leads
    WHERE restaurant_id = res_id
    AND next_follow_up = today_date;

    -- 7. Never Contacted (Older than 24h)
    SELECT count(*) INTO never_contacted_24h
    FROM leads
    WHERE restaurant_id = res_id
    AND status = 'new'
    AND created_at < yesterday_iso;

    -- Build JSON result
    result := json_build_object(
        'newLeadsToday', COALESCE(new_leads_today, 0),
        'contactedToday', COALESCE(contacted_today, 0),
        'reservationsCreated', COALESCE(reservations_created, 0),
        'completedReservations', COALESCE(completed_reservations, 0),
        'overdueFollowUps', COALESCE(overdue_follow_ups, 0),
        'followUpsDueToday', COALESCE(follow_ups_due_today, 0),
        'neverContacted24h', COALESCE(never_contacted_24h, 0),
        'last14DaysRevenue', '[]'::json, 
        'totalRevenue', 0,     
        'topMenuItems', '[]'::json 
    );

    RETURN result;
END;
$$;
