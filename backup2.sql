--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: basket_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.basket_items (
    id integer NOT NULL,
    user_id integer,
    product_id integer,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.basket_items OWNER TO neondb_owner;

--
-- Name: basket_items_decimal; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.basket_items_decimal (
    id integer NOT NULL,
    basket_item_id integer,
    quantity_decimal text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.basket_items_decimal OWNER TO neondb_owner;

--
-- Name: basket_items_decimal_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.basket_items_decimal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.basket_items_decimal_id_seq OWNER TO neondb_owner;

--
-- Name: basket_items_decimal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.basket_items_decimal_id_seq OWNED BY public.basket_items_decimal.id;


--
-- Name: basket_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.basket_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.basket_items_id_seq OWNER TO neondb_owner;

--
-- Name: basket_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.basket_items_id_seq OWNED BY public.basket_items.id;


--
-- Name: donations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.donations (
    id integer NOT NULL,
    user_id integer,
    items jsonb,
    quantities jsonb,
    total_amount text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.donations OWNER TO neondb_owner;

--
-- Name: donations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.donations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donations_id_seq OWNER TO neondb_owner;

--
-- Name: donations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.donations_id_seq OWNED BY public.donations.id;


--
-- Name: email_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_reports (
    id integer NOT NULL,
    shift_id integer,
    report_type text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    recipient_email text,
    sent_at timestamp without time zone DEFAULT now(),
    shift_date text,
    worker_name text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_reports OWNER TO neondb_owner;

--
-- Name: email_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_reports_id_seq OWNER TO neondb_owner;

--
-- Name: email_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_reports_id_seq OWNED BY public.email_reports.id;


--
-- Name: expense_payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expense_payments (
    id integer NOT NULL,
    expense_id integer NOT NULL,
    shift_id integer,
    payment_amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone DEFAULT now(),
    worker_name text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.expense_payments OWNER TO neondb_owner;

--
-- Name: expense_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.expense_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_payments_id_seq OWNER TO neondb_owner;

--
-- Name: expense_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.expense_payments_id_seq OWNED BY public.expense_payments.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    description text NOT NULL,
    amount text NOT NULL,
    worker_name text NOT NULL,
    expense_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    shift_id integer,
    paid_amount numeric(10,2) DEFAULT 0.00,
    outstanding_amount numeric(10,2),
    payment_status text DEFAULT 'unpaid'::character varying,
    last_payment_date timestamp without time zone
);


ALTER TABLE public.expenses OWNER TO neondb_owner;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO neondb_owner;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    pickup_code text NOT NULL,
    items jsonb NOT NULL,
    quantities jsonb NOT NULL,
    total_price text NOT NULL,
    status text DEFAULT 'pending'::text,
    archived_from_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    shift_id integer,
    custom_pricing_used boolean DEFAULT false,
    custom_description text
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO neondb_owner;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    category text,
    product_type text,
    product_code text NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    admin_price text DEFAULT '0'::text NOT NULL,
    supplier text,
    on_shelf_grams numeric(10,2) DEFAULT 0 NOT NULL,
    internal_grams numeric(10,2) DEFAULT 0 NOT NULL,
    external_grams numeric(10,2) DEFAULT 0 NOT NULL,
    cost_price text DEFAULT '0'::text NOT NULL,
    shelf_price text DEFAULT '0'::text NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    worker_name text,
    entry_date text,
    jar_weight numeric(10,2)
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: shift_activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shift_activities (
    id integer NOT NULL,
    shift_id integer NOT NULL,
    activity_type text NOT NULL,
    activity_id integer,
    description text NOT NULL,
    amount text,
    "timestamp" timestamp without time zone DEFAULT now(),
    metadata jsonb
);


ALTER TABLE public.shift_activities OWNER TO neondb_owner;

--
-- Name: shift_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shift_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shift_activities_id_seq OWNER TO neondb_owner;

--
-- Name: shift_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shift_activities_id_seq OWNED BY public.shift_activities.id;


--
-- Name: shift_reconciliations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shift_reconciliations (
    id integer NOT NULL,
    shift_date timestamp without time zone DEFAULT now(),
    product_counts jsonb NOT NULL,
    discrepancies jsonb NOT NULL,
    total_discrepancies numeric(10,2) DEFAULT 0.00,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now(),
    cash_in_till text DEFAULT '0'::text,
    coins text DEFAULT '0'::text,
    notes_amount text DEFAULT '0'::text
);


ALTER TABLE public.shift_reconciliations OWNER TO neondb_owner;

--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shift_reconciliations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shift_reconciliations_id_seq OWNER TO neondb_owner;

--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shift_reconciliations_id_seq OWNED BY public.shift_reconciliations.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    shift_id text NOT NULL,
    worker_name text NOT NULL,
    start_time timestamp without time zone DEFAULT now(),
    end_time timestamp without time zone,
    status text DEFAULT 'active'::text NOT NULL,
    shift_date text NOT NULL,
    total_sales text DEFAULT '0'::text,
    total_expenses text DEFAULT '0'::text,
    net_amount text DEFAULT '0'::text,
    stock_discrepancies numeric(10,2) DEFAULT 0.00,
    reconciliation_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    starting_till_amount text DEFAULT '0'::text
);


ALTER TABLE public.shifts OWNER TO neondb_owner;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_id_seq OWNER TO neondb_owner;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: stock_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_logs (
    id integer NOT NULL,
    shift_id integer,
    product_id integer,
    action_type text NOT NULL,
    worker_name text NOT NULL,
    action_date timestamp without time zone DEFAULT now(),
    product_name text,
    old_values jsonb,
    new_values jsonb,
    quantity_changed integer,
    location_from text,
    location_to text,
    notes text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stock_logs OWNER TO neondb_owner;

--
-- Name: stock_logs_decimal; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_logs_decimal (
    id integer NOT NULL,
    stock_log_id integer,
    quantity_changed_decimal text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stock_logs_decimal OWNER TO neondb_owner;

--
-- Name: stock_logs_decimal_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_logs_decimal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_logs_decimal_id_seq OWNER TO neondb_owner;

--
-- Name: stock_logs_decimal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_logs_decimal_id_seq OWNED BY public.stock_logs_decimal.id;


--
-- Name: stock_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_logs_id_seq OWNER TO neondb_owner;

--
-- Name: stock_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_logs_id_seq OWNED BY public.stock_logs.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    from_location text NOT NULL,
    to_location text NOT NULL,
    quantity integer NOT NULL,
    worker_name text NOT NULL,
    movement_date text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    quantity_decimal numeric(10,2)
);


ALTER TABLE public.stock_movements OWNER TO neondb_owner;

--
-- Name: stock_movements_decimal; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_movements_decimal (
    id integer NOT NULL,
    stock_movement_id integer,
    quantity_decimal text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stock_movements_decimal OWNER TO neondb_owner;

--
-- Name: stock_movements_decimal_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_movements_decimal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_decimal_id_seq OWNER TO neondb_owner;

--
-- Name: stock_movements_decimal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_movements_decimal_id_seq OWNED BY public.stock_movements_decimal.id;


--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO neondb_owner;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text,
    first_name text,
    last_name text,
    phone_number text,
    date_of_birth text,
    address text,
    profile_image_url text,
    id_image_url text,
    is_onboarded boolean DEFAULT false,
    onboarding_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    membership_status text DEFAULT 'pending'::text,
    approval_date timestamp without time zone,
    expiry_date timestamp without time zone,
    approved_by text,
    renewal_count integer DEFAULT 0,
    last_active timestamp without time zone,
    id_back_image_url text,
    role text,
    is_banned boolean DEFAULT false,
    banned_by text,
    banned_at timestamp without time zone,
    ban_reason text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: basket_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items ALTER COLUMN id SET DEFAULT nextval('public.basket_items_id_seq'::regclass);


--
-- Name: basket_items_decimal id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items_decimal ALTER COLUMN id SET DEFAULT nextval('public.basket_items_decimal_id_seq'::regclass);


--
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


--
-- Name: email_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_reports ALTER COLUMN id SET DEFAULT nextval('public.email_reports_id_seq'::regclass);


--
-- Name: expense_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_payments ALTER COLUMN id SET DEFAULT nextval('public.expense_payments_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: shift_activities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_activities ALTER COLUMN id SET DEFAULT nextval('public.shift_activities_id_seq'::regclass);


--
-- Name: shift_reconciliations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_reconciliations ALTER COLUMN id SET DEFAULT nextval('public.shift_reconciliations_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: stock_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs ALTER COLUMN id SET DEFAULT nextval('public.stock_logs_id_seq'::regclass);


--
-- Name: stock_logs_decimal id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs_decimal ALTER COLUMN id SET DEFAULT nextval('public.stock_logs_decimal_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: stock_movements_decimal id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements_decimal ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_decimal_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: basket_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.basket_items (id, user_id, product_id, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: basket_items_decimal; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.basket_items_decimal (id, basket_item_id, quantity_decimal, created_at) FROM stdin;
\.


--
-- Data for Name: donations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.donations (id, user_id, items, quantities, total_amount, status, created_at) FROM stdin;
1	1	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 2, "productId": 1}]	24	completed	2025-08-26 19:23:54.96178
2	1	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 3}]	23	completed	2025-08-26 19:23:54.96178
3	1	[{"id": 2, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 2, "createdAt": "2025-08-26T19:54:18.112Z", "productId": 1}, {"id": 1, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 2, "createdAt": "2025-08-26T19:54:16.674Z", "productId": 4}]	\N	54	pending	2025-08-26 19:54:20.883762
4	1	[{"id": 4, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-08-26T19:55:11.503Z", "productId": 5}, {"id": 3, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-26T19:55:10.535Z", "productId": 6}]	\N	22	pending	2025-08-26 19:55:13.995039
5	1	[{"id": 7, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 1, "createdAt": "2025-08-26T21:18:38.903Z", "productId": 3}, {"id": 6, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-08-26T21:18:37.694Z", "productId": 5}, {"id": 5, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-26T21:18:36.714Z", "productId": 6}]	\N	35	pending	2025-08-26 21:18:58.146012
6	1	[{"id": 8, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-26T21:24:22.291Z", "productId": 2}, {"id": 9, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 1, "createdAt": "2025-08-26T21:24:23.533Z", "productId": 1}, {"id": 10, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 1, "createdAt": "2025-08-26T21:24:24.757Z", "productId": 4}, {"id": 11, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 1, "createdAt": "2025-08-26T21:24:25.429Z", "productId": 3}, {"id": 12, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-08-26T21:24:26.646Z", "productId": 5}, {"id": 13, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-26T21:24:30.569Z", "productId": 6}]	\N	72	pending	2025-08-26 21:24:33.866151
7	1	[{"id": 15, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-27T15:54:25.947Z", "productId": 2}, {"id": 14, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 1, "createdAt": "2025-08-27T15:54:25.381Z", "productId": 1}]	\N	22	pending	2025-08-27 15:54:27.696729
8	1	[{"id": 16, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 1, "createdAt": "2025-08-27T15:58:57.855Z", "productId": 4}, {"id": 17, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 1, "createdAt": "2025-08-27T15:59:00.407Z", "productId": 3}]	\N	28	pending	2025-08-27 15:59:02.721032
9	1	[{"id": 18, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-27T16:21:23.825Z", "productId": 2}]	\N	10	pending	2025-08-27 16:21:26.07926
10	1	[{"id": 19, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-27T16:39:03.154Z", "productId": 6}]	\N	10	pending	2025-08-27 16:39:05.95653
11	1	[{"id": 20, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-27T16:46:31.756Z", "productId": 2}]	\N	10	pending	2025-08-27 16:46:34.802644
12	1	[{"id": 21, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-08-27T19:13:27.374Z", "productId": 5}, {"id": 22, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 1, "createdAt": "2025-08-27T19:13:30.208Z", "productId": 3}]	\N	25	pending	2025-08-27 19:13:32.656835
13	1	[{"id": 23, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 1, "createdAt": "2025-08-27T19:53:22.567Z", "productId": 1}, {"id": 24, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-27T19:53:24.839Z", "productId": 6}, {"id": 25, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-27T19:53:26.403Z", "productId": 2}, {"id": 26, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-08-27T19:53:28.613Z", "productId": 5}]	\N	44	pending	2025-08-27 19:53:31.746502
14	1	[{"id": 27, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-08-27T20:20:48.392Z", "productId": 2}]	\N	10	pending	2025-08-27 20:20:52.082632
15	1	[{"id": 28, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 1, "createdAt": "2025-08-27T20:30:36.131Z", "productId": 1}]	\N	12	pending	2025-08-27 20:30:38.359264
16	1	[{"id": 29, "userId": 1, "product": {"id": 6, "name": "Dry-Shift Hash", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium sativa hash with clean taste", "productCode": "DS1410"}, "quantity": 1, "createdAt": "2025-08-27T20:31:02.462Z", "productId": 6}]	\N	10	pending	2025-08-27 20:31:04.136797
28	1	[{"id": 46, "userId": 1, "product": {"id": 7, "name": "test", "category": "Sativa", "imageUrl": "/objects/uploads/6236bed8-0f44-4419-98f3-3751cd1e297b", "isActive": true, "createdAt": "2025-08-28T11:45:17.500Z", "description": "test", "productCode": "BD7810"}, "quantity": 1, "createdAt": "2025-08-28T11:45:28.678Z", "productId": 7}]	\N	10	pending	2025-08-28 11:45:30.710547
29	1	[{"id": 47, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4312"}, "quantity": 1, "createdAt": "2025-08-31T19:10:03.440Z", "productId": 1}, {"id": 48, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 2, "createdAt": "2025-08-31T19:10:06.691Z", "productId": 5}]	\N	36	pending	2025-08-31 19:10:47.86279
30	1	[{"id": 50, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 1, "createdAt": "2025-09-01T18:11:42.469Z", "productId": 4}, {"id": 49, "userId": 1, "product": {"id": 7, "name": "StarDog", "category": "Sativa", "imageUrl": "/objects/uploads/6236bed8-0f44-4419-98f3-3751cd1e297b", "isActive": true, "createdAt": "2025-08-28T11:45:17.500Z", "description": "test", "productCode": "BD7810"}, "quantity": 1, "createdAt": "2025-09-01T18:11:39.366Z", "productId": 7}, {"id": 51, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 2, "createdAt": "2025-09-01T19:13:12.064Z", "productId": 3}]	\N	51	pending	2025-09-01 19:14:10.283293
31	1	[{"id": 52, "userId": 1, "product": {"id": 3, "name": "Lemon Haze", "category": "Sativa", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Energizing Sativa with citrusy lemon aroma", "productCode": "LH2213"}, "quantity": 1, "createdAt": "2025-09-01T19:14:41.063Z", "productId": 3}]	\N	13	pending	2025-09-01 19:14:44.521918
32	1	[{"id": 53, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 1, "createdAt": "2025-09-01T19:15:00.150Z", "productId": 4}]	\N	15	pending	2025-09-01 19:15:10.810246
33	1	[{"id": 54, "userId": 1, "product": {"id": 5, "name": "Moroccan Hash", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Traditional hash with earthy flavors", "productCode": "MH5812"}, "quantity": 1, "createdAt": "2025-09-01T19:15:18.732Z", "productId": 5}]	\N	12	pending	2025-09-01 19:15:22.867213
34	1	[{"id": 55, "userId": 1, "product": {"id": 7, "name": "StarDog", "category": "Sativa", "imageUrl": "/objects/uploads/6236bed8-0f44-4419-98f3-3751cd1e297b", "isActive": true, "createdAt": "2025-08-28T11:45:17.500Z", "description": "test", "productCode": "BD7810"}, "quantity": 1, "createdAt": "2025-09-01T19:15:29.705Z", "productId": 7}]	\N	10	pending	2025-09-01 19:15:33.770737
35	1	[{"id": 56, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-09-01T19:25:59.842Z", "productId": 2}]	\N	10	pending	2025-09-01 19:26:02.884812
36	1	[{"id": 57, "userId": 1, "product": {"id": 2, "name": "Blue Dream", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Popular Sativa-dominant hybrid with blueberry notes", "productCode": "BD7010"}, "quantity": 1, "createdAt": "2025-09-01T19:26:23.709Z", "productId": 2}]	\N	10	pending	2025-09-01 19:26:26.901562
37	1	[{"id": 58, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4318"}, "quantity": 1, "createdAt": "2025-09-01T19:27:07.372Z", "productId": 1}]	\N	18	pending	2025-09-01 19:27:10.579098
38	1	[{"id": 59, "userId": 1, "product": {"id": 1, "name": "Zkittlez", "category": "Indica", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "dealPrice": null, "adminPrice": "12.00", "shelfPrice": "12.00", "description": "Premium indoor Indica strain with sweet fruity flavors", "productCode": "ZK4318"}, "quantity": 1, "createdAt": "2025-09-01T19:33:25.845Z", "productId": 1}]	\N	12	pending	2025-09-01 19:33:28.920932
39	1	[{"id": 60, "userId": 1, "product": {"id": 4, "name": "Wedding Cake", "category": "Hybrid", "imageUrl": "/api/placeholder/300/200", "isActive": true, "createdAt": "2025-08-26T19:23:40.245Z", "dealPrice": null, "adminPrice": "15", "shelfPrice": "15.00", "description": "Relaxing Indica-dominant hybrid with vanilla undertones", "productCode": "WC9615"}, "quantity": 1, "createdAt": "2025-09-02T09:52:25.793Z", "productId": 4}]	\N	15	pending	2025-09-02 09:52:28.712078
\.


--
-- Data for Name: email_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_reports (id, shift_id, report_type, subject, content, recipient_email, sent_at, shift_date, worker_name, metadata, created_at) FROM stdin;
14	70	shift_end	Shift Report - Test - 03/09/2025	Worker: Test\nShift - 03/09/2025 01:01 - 10:56\n\nDISPENSARY\nNo orders processed during this shift\n\nSTOCK DISCREPANCIES\nZkittlez: 79.5g missing\nLemon Haze: 133g missing\nWedding Cake: 139g missing\nMoroccan Hash 2: 158g missing\nDry-Shift Hash: 150.5g missing\nvapes2: 94 units missing\nTest Product 3: 95.5g missing\nFinal Test Product: 195.5g missing\nWorking Product: 95g missing\n\nMEMBER DETAILS\nNew members: 0\nAll members: 3\nActive members: 3\nRenewed members: 0\nExpired members: 0\n\nFINANCIAL SUMMARY\nEXPENSES\nCurrent Shift Expenses:\n  Test: ₳200 paid of ₳800 (partial)\nOutstanding from Previous Shifts: None\nTotal payments made this shift: ₳200.00\n\nStarting till: ₳500\nCash in till: ₳5\nNotes: 5\nCoins: 5\nTotal collections: ₳0.00\nNet total: ₳0.00\n\nMONEY RECONCILIATION\nExpected in till: ₳300.00\nActual in till: ₳5.00\n₳295.00 missing\n\n	management@demo-social-club.com	2025-09-28 08:56:08.163169	03/09/2025	Test	{"netAmount": "0.00", "totalSales": "0.00", "shiftEndTime": "10:56", "totalExpenses": "0.00", "shiftStartTime": "01:01", "stockDiscrepancies": "1140.00"}	2025-09-28 08:56:08.163169
\.


--
-- Data for Name: expense_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expense_payments (id, expense_id, shift_id, payment_amount, payment_date, worker_name, notes, created_at) FROM stdin;
1	21	\N	3.00	2025-09-02 18:53:25.364818	Callum	Partial payment test	2025-09-02 18:53:25.364818
2	21	\N	2.00	2025-09-02 18:53:40.692408	Callum	Final payment - completing expense	2025-09-02 18:53:40.692408
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, description, amount, worker_name, expense_date, created_at, shift_id, paid_amount, outstanding_amount, payment_status, last_payment_date) FROM stdin;
21	5	5	5	2025-08-27 22:57:19.528491	2025-08-27 22:57:19.528491	\N	5.00	0.00	paid	2025-09-02 18:53:40.692408
39	Test	800	T	2025-09-03 23:02:16.951726	2025-09-03 23:02:16.951726	70	200.00	600.00	partial	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, user_id, pickup_code, items, quantities, total_price, status, archived_from_admin, created_at, shift_id, custom_pricing_used, custom_description) FROM stdin;
47	1	4722	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 1, "productId": 4}]	15	cancelled	f	2025-09-02 09:52:28.659605	55	f	\N
49	\N	1728	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 10, "productId": 1}]	120	completed	f	2025-09-02 10:11:54.00324	56	f	\N
50	\N	7671	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 4, "productId": 20}]	40	completed	f	2025-09-02 11:42:09.50094	57	f	\N
51	\N	2622	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 0.2, "productId": 20}]	2	completed	f	2025-09-02 17:04:25.920945	58	f	\N
54	\N	1472	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 0.2, "productId": 20}]	2	completed	f	2025-09-02 17:05:10.554394	58	f	\N
55	\N	9850	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 0.5, "productId": 20}]	5	completed	f	2025-09-02 17:58:02.30998	58	f	\N
1	1	4721	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 2, "productId": 1}]	24	completed	t	2025-08-26 19:23:48.939127	\N	f	\N
33	1	1821	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}]	[{"quantity": 1, "productId": 1}, {"quantity": 2, "productId": 5}]	36	completed	t	2025-08-31 19:10:47.815062	47	f	\N
34	\N	9569	[{"name": "StarDog", "category": "Cannabis", "productId": 7, "productCode": "BD7810"}]	[{"quantity": 4, "productId": 7}]	20	completed	t	2025-09-01 18:18:07.068894	\N	f	\N
35	\N	6870	[{"name": "Lemon Haze", "category": "Cannabis", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 3}]	10	completed	t	2025-09-01 19:11:14.753308	\N	f	\N
40	1	8089	[{"name": "StarDog", "category": "Sativa", "productId": 7, "productCode": "BD7810"}]	[{"quantity": 1, "productId": 7}]	10	pending	t	2025-09-01 19:15:33.734571	48	f	\N
43	1	6904	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}]	[{"quantity": 1, "productId": 2}]	10	pending	t	2025-09-01 19:26:02.840573	\N	f	\N
44	1	2985	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}]	[{"quantity": 1, "productId": 2}]	10	pending	t	2025-09-01 19:26:26.864986	50	f	\N
46	1	1958	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 1, "productId": 1}]	12	completed	t	2025-09-01 19:33:28.879975	50	f	\N
41	\N	4725	[{"name": "Lemon Haze", "category": "Cannabis", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 3}]	10	completed	t	2025-09-01 19:16:48.984742	48	f	\N
45	1	6161	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 1, "productId": 1}]	18	pending	t	2025-09-01 19:27:10.541605	50	f	\N
56	\N	7590	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 1, "productId": 1}]	12	completed	f	2025-09-02 18:01:03.476719	58	f	\N
59	\N	6620	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 1, "productId": 20}]	10	completed	f	2025-09-02 18:06:12.361973	59	f	\N
60	\N	1662	[{"name": "weed", "category": "Cannabis", "productId": 24, "productCode": "GH8888"}]	[{"quantity": 1, "productId": 24}]	10	completed	f	2025-09-02 18:17:07.335599	\N	f	\N
63	\N	8405	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 0.5, "productId": 1}]	6	completed	f	2025-09-02 18:22:07.375169	\N	f	\N
65	\N	9606	[{"name": "Dry-Shift Hash", "category": "Hash", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 0.5, "productId": 6}]	5	completed	f	2025-09-02 20:14:53.968767	60	f	\N
66	\N	8737	[{"name": "Lemon Haze", "category": "Cannabis", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 3}]	10	completed	f	2025-09-03 10:08:31.1089	\N	f	\N
8	1	3776	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 1}]	22	completed	t	2025-08-27 15:54:27.656975	\N	f	\N
2	1	8935	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 3}]	23	completed	t	2025-08-26 19:23:48.939127	\N	f	\N
36	1	6956	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}, {"name": "StarDog", "category": "Sativa", "productId": 7, "productCode": "BD7810"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 4}, {"quantity": 1, "productId": 7}, {"quantity": 2, "productId": 3}]	51	pending	t	2025-09-01 19:14:10.244299	48	f	\N
30	\N	7648	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 1, "productId": 1}]	12	completed	t	2025-08-28 11:10:54.736444	\N	f	\N
31	\N	4117	[{"name": "Moroccan Hash", "category": "Hash", "productId": 5, "productCode": "MH5812"}]	[{"quantity": 1, "productId": 5}]	12	completed	t	2025-08-28 11:11:38.55559	45	f	\N
32	1	4516	[{"name": "test", "category": "Sativa", "productId": 7, "productCode": "BD7810"}]	[{"quantity": 1, "productId": 7}]	10	completed	t	2025-08-28 11:45:30.667967	46	f	\N
37	1	3796	[{"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 3}]	13	completed	t	2025-09-01 19:14:44.484207	48	f	\N
48	\N	9486	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 1, "productId": 1}]	12	completed	f	2025-09-02 09:53:55.28921	55	f	\N
38	1	9239	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 1, "productId": 4}]	15	completed	t	2025-09-01 19:15:10.773062	48	f	\N
42	\N	4156	[{"name": "Lemon Haze", "category": "Cannabis", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 3}]	10	completed	t	2025-09-01 19:17:46.847796	49	f	\N
3	1	2164	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 3, "productId": 4}]	45	pending	t	2025-08-26 19:23:48.939127	\N	f	\N
4	1	4959	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 2, "productId": 1}, {"quantity": 2, "productId": 4}]	54	completed	t	2025-08-26 19:54:20.841171	\N	f	\N
5	1	7269	[{"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	22	completed	t	2025-08-26 19:55:13.955429	\N	f	\N
52	\N	2183	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 0.2, "productId": 20}]	2	completed	f	2025-09-02 17:04:33.370096	58	f	\N
57	\N	5264	[{"name": "vapes", "category": "Vapes", "productId": 23, "productCode": "999999"}]	[{"quantity": 1, "productId": 23}]	5	completed	f	2025-09-02 18:01:09.940275	58	f	\N
61	\N	9177	[{"name": "weed", "category": "Cannabis", "productId": 24, "productCode": "GH8888"}]	[{"quantity": 0.5, "productId": 24}]	5	completed	f	2025-09-02 18:17:27.295591	\N	f	\N
64	\N	5750	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4318"}]	[{"quantity": 0.5, "productId": 1}]	6	completed	f	2025-09-02 18:23:23.73889	\N	f	\N
6	1	6714	[{"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 3}, {"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	35	completed	t	2025-08-26 21:18:58.100597	\N	f	\N
9	1	2477	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 4}, {"quantity": 1, "productId": 3}]	28	completed	t	2025-08-27 15:59:02.677437	\N	f	\N
10	1	5460	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}]	[{"quantity": 1, "productId": 2}]	10	completed	t	2025-08-27 16:21:26.036497	\N	f	\N
12	1	4796	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}]	[{"quantity": 1, "productId": 2}]	10	completed	t	2025-08-27 16:46:34.761771	\N	f	\N
7	1	7155	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 1}, {"quantity": 1, "productId": 4}, {"quantity": 1, "productId": 3}, {"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	72	completed	t	2025-08-26 21:24:33.821238	\N	f	\N
15	1	2642	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}]	[{"quantity": 1, "productId": 2}]	10	completed	t	2025-08-27 20:20:52.041518	\N	f	\N
39	1	5712	[{"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}]	[{"quantity": 1, "productId": 5}]	12	completed	t	2025-09-01 19:15:22.830719	48	f	\N
11	1	9270	[{"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 6}]	10	completed	t	2025-08-27 16:39:05.915131	\N	f	\N
13	1	2294	[{"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 3}]	25	completed	t	2025-08-27 19:13:32.616337	\N	f	\N
14	1	6561	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}, {"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}]	[{"quantity": 1, "productId": 1}, {"quantity": 1, "productId": 6}, {"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 5}]	44	completed	t	2025-08-27 19:53:31.704702	\N	f	\N
16	1	5816	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 1, "productId": 1}]	12	pending	t	2025-08-27 20:30:38.317002	\N	f	\N
62	\N	2459	[{"name": "weed", "category": "Cannabis", "productId": 24, "productCode": "GH8888"}]	[{"quantity": 0.5, "productId": 24}]	5	completed	f	2025-09-02 18:18:02.011101	\N	f	\N
17	1	9313	[{"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 6}]	10	completed	t	2025-08-27 20:31:04.095858	40	f	\N
29	\N	7482	[{"name": "Wedding Cake", "category": "Cannabis", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 1, "productId": 4}]	15	completed	t	2025-08-28 11:10:20.738803	44	f	\N
53	\N	3295	[{"name": "wax", "category": "Wax", "productId": 20, "productCode": "666666"}]	[{"quantity": 1, "productId": 20}]	10	completed	f	2025-09-02 17:04:47.058573	58	f	\N
58	\N	3955	[{"name": "vapes", "category": "Vapes", "productId": 23, "productCode": "999999"}]	[{"quantity": 1, "productId": 23}]	5	completed	f	2025-09-02 18:06:02.827399	59	f	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, image_url, category, product_type, product_code, stock_quantity, admin_price, supplier, on_shelf_grams, internal_grams, external_grams, cost_price, shelf_price, last_updated, is_active, created_at, worker_name, entry_date, jar_weight) FROM stdin;
6	Dry-Shift Hash	Premium sativa hash with clean taste	/api/placeholder/300/200	Sativa	Hash	DS1410	235	10	Alpine Hash Co	155.50	29.00	50.00	7.50	10.00	2025-09-02 20:14:54.084	t	2025-08-26 19:23:40.245968	\N	\N	\N
3	Lemon Haze	Energizing Sativa with citrusy lemon aroma	/api/placeholder/300/200	Sativa	Cannabis	LH2213	211	13.00	Dutch Masters	138.00	10.00	63.00	9.00	13.00	2025-09-03 10:08:31.225	t	2025-08-26 19:23:40.245968	dec	2025-09-01	\N
4	Wedding Cake	Relaxing Indica-dominant hybrid with vanilla undertones	/api/placeholder/300/200	Hybrid	Cannabis	WC9615	259	15.00	Wedding Growers	139.00	70.00	50.00	11.00	15.00	2025-09-03 10:08:55.448	t	2025-08-26 19:23:40.245968	dec	2025-09-03	150.00
26	vapes2			\N	Vapes	999999	99	9	9	99.00	0.00	0.00	9	9	2025-09-03 10:24:14.207	t	2025-09-03 10:24:14.22424	dec	2025-09-03	0.00
1	Zkittlez	Premium indoor Indica strain with sweet fruity flavors	/api/placeholder/300/200	Indica	Cannabis	ZK4318	111	12.00	Premium Growers Ltd	80.50	20.50	10.00	8.00	12.00	2025-09-04 12:21:42.367	t	2025-08-26 19:23:40.245968	TestWorker	2025-09-02	\N
\.


--
-- Data for Name: shift_activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_activities (id, shift_id, activity_type, activity_id, description, amount, "timestamp", metadata) FROM stdin;
206	70	shift_start	70	Shift started by Test	\N	2025-09-03 23:01:54.198799	{"action": "start", "worker": "Test"}
207	70	expense	39	Expense logged: Test	800	2025-09-03 23:02:17.126775	{"worker": "T", "description": "Test"}
208	70	reconciliation	108	Stock reconciliation completed. 1140.00 discrepancies found.	\N	2025-09-28 08:56:05.680362	{"products": 9, "discrepancies": "1140.00", "reconciliationId": 108}
\.


--
-- Data for Name: shift_reconciliations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_reconciliations (id, shift_date, product_counts, discrepancies, total_discrepancies, admin_notes, created_at, cash_in_till, coins, notes_amount) FROM stdin;
1	2025-08-26 19:57:32.489963	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675.00	\N	2025-08-26 19:57:32.489963	0	0	0
2	2025-08-26 19:57:40.944119	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675.00	\N	2025-08-26 19:57:40.944119	0	0	0
3	2025-08-26 19:57:51.117408	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675.00	\N	2025-08-26 19:57:51.117408	0	0	0
4	2025-08-26 19:59:55.862732	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675.00	\N	2025-08-26 19:59:55.862732	0	0	0
5	2025-08-26 20:02:54.425962	{"1": 5, "2": 5, "3": 5, "4": 3, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 3, "expected": 150, "difference": 147, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676.00	\N	2025-08-26 20:02:54.425962	0	0	0
6	2025-08-26 20:06:28.699571	{"1": 5, "2": 5, "3": 4, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 4, "expected": 97, "difference": 93, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675.00	\N	2025-08-26 20:06:28.699571	0	0	0
7	2025-08-26 20:11:54.575036	{"1": 5, "2": 5, "3": 3, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 3, "expected": 97, "difference": 94, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676.00	\N	2025-08-26 20:11:54.575036	0	0	0
8	2025-08-26 20:17:56.253533	{"1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1}	{"1": {"type": "missing", "actual": 1, "expected": 65, "difference": 64, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 1, "expected": 52, "difference": 51, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 1, "expected": 97, "difference": 96, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 1, "expected": 150, "difference": 149, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 1, "expected": 180, "difference": 179, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 1, "expected": 160, "difference": 159, "productName": "Dry-Shift Hash"}}	698.00	\N	2025-08-26 20:17:56.253533	0	0	0
9	2025-08-26 20:35:28.138315	{"1": 5, "2": 5, "3": 3, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 3, "expected": 97, "difference": 94, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676.00	\N	2025-08-26 20:35:28.138315	0	0	0
10	2025-08-26 20:46:34.720469	{"1": 5, "2": 5, "3": 2, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 2, "expected": 97, "difference": 95, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	677.00	\N	2025-08-26 20:46:34.720469	0	0	0
11	2025-08-26 21:12:44.116732	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	674.00	\N	2025-08-26 21:12:44.116732	0	0	0
12	2025-08-26 21:26:00.240964	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 51, "difference": 46, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 95, "difference": 90, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 149, "difference": 144, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash"}}	665.00	\N	2025-08-26 21:26:00.240964	0	0	0
13	2025-08-26 21:27:31.037096	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 0, "expected": 51, "difference": 51, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 95, "difference": 90, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 149, "difference": 144, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash"}}	670.00	\N	2025-08-26 21:27:31.037096	0	0	0
14	2025-08-26 21:47:47.378219	{"1": 5, "2": 5, "3": 5, "4": 1, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 51, "difference": 46, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 95, "difference": 90, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 1, "expected": 149, "difference": 148, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash"}}	669.00	\N	2025-08-26 21:47:47.378219	0	0	0
15	2025-08-27 15:51:39.682505	{"1": 5, "2": 5, "3": 1, "4": 5, "5": 5, "6": 0}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 51, "difference": 46, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 1, "expected": 95, "difference": 94, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 149, "difference": 144, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 0, "expected": 158, "difference": 158, "productName": "Dry-Shift Hash"}}	674.00	\N	2025-08-27 15:51:39.682505	50	50	50
16	2025-08-27 15:57:01.232025	{"1": 197, "2": 178, "3": 218, "4": 269, "5": 288, "6": 238}	{"1": {"type": "excess", "actual": 197, "expected": 63, "difference": 134, "productName": "Zkittlez"}, "2": {"type": "excess", "actual": 178, "expected": 50, "difference": 128, "productName": "Blue Dream"}, "3": {"type": "excess", "actual": 218, "expected": 95, "difference": 123, "productName": "Lemon Haze"}, "4": {"type": "excess", "actual": 269, "expected": 149, "difference": 120, "productName": "Wedding Cake"}, "5": {"type": "excess", "actual": 288, "expected": 178, "difference": 110, "productName": "Moroccan Hash"}, "6": {"type": "excess", "actual": 238, "expected": 158, "difference": 80, "productName": "Dry-Shift Hash"}}	695.00	\N	2025-08-27 15:57:01.232025	50	5	40
17	2025-08-27 16:03:13.836222	{"1": 198, "2": 177, "3": 217, "4": 268, "5": 288, "6": 238}	{"1": {"type": "excess", "actual": 198, "expected": 63, "difference": 135, "productName": "Zkittlez"}, "2": {"type": "excess", "actual": 177, "expected": 50, "difference": 127, "productName": "Blue Dream"}, "3": {"type": "excess", "actual": 217, "expected": 94, "difference": 123, "productName": "Lemon Haze"}, "4": {"type": "excess", "actual": 268, "expected": 148, "difference": 120, "productName": "Wedding Cake"}, "5": {"type": "excess", "actual": 288, "expected": 178, "difference": 110, "productName": "Moroccan Hash"}, "6": {"type": "excess", "actual": 238, "expected": 158, "difference": 80, "productName": "Dry-Shift Hash"}}	695.00	\N	2025-08-27 16:03:13.836222	478	0	0
18	2025-08-27 16:09:25.522486	{"1": 199, "2": 178, "3": 217, "4": 267, "5": 288, "6": 238}	{"1": {"type": "excess", "actual": 199, "expected": 63, "difference": -136, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 178, "expected": 50, "difference": -128, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "excess", "actual": 217, "expected": 94, "difference": -123, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 267, "expected": 148, "difference": -119, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "excess", "actual": 288, "expected": 178, "difference": -110, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "excess", "actual": 238, "expected": 158, "difference": -80, "productName": "Dry-Shift Hash", "productType": "Hash"}}	696.00	\N	2025-08-27 16:09:25.522486	10	0	0
19	2025-08-27 16:15:05.026503	{"1": 63, "2": 49, "3": 94, "4": 148, "5": 177, "6": 159}	{"2": {"type": "missing", "actual": 49, "expected": 50, "difference": 1, "productName": "Blue Dream", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 177, "expected": 178, "difference": 1, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "excess", "actual": 159, "expected": 158, "difference": -1, "productName": "Dry-Shift Hash", "productType": "Hash"}}	3.00	\N	2025-08-27 16:15:05.026503	50	0	0
20	2025-08-27 16:22:04.464974	{"1": 5, "2": 5, "3": 5, "4": 0, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 94, "difference": 89, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 148, "difference": 148, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash", "productType": "Hash"}}	665.00	\N	2025-08-27 16:22:04.464974	15	0	0
21	2025-08-27 16:39:44.526635	{"1": 5, "2": 5, "3": 2, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 2, "expected": 94, "difference": 92, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	662.00	\N	2025-08-27 16:39:44.526635	19	0	0
22	2025-08-27 16:45:06.221325	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 94, "difference": 89, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	659.00	\N	2025-08-27 16:45:06.221325	5	7	10
23	2025-08-27 16:47:02.474009	{"1": 5, "2": 5, "3": 0, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 94, "difference": 94, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	663.00	\N	2025-08-27 16:47:02.474009	5	10	10
24	2025-08-27 19:10:39.330756	{"1": 5, "2": 0, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 48, "difference": 48, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 94, "difference": 89, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	663.00	\N	2025-08-27 19:10:39.330756	5	8	9
25	2025-08-27 19:14:51.750209	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	656.00	\N	2025-08-27 19:14:51.750209	5	10	5
26	2025-08-27 19:17:42.905372	{"1": 5, "2": 5, "3": 1000, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "excess", "actual": 1000, "expected": 93, "difference": -907, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1475.00	\N	2025-08-27 19:17:42.905372	5	5	5
27	2025-08-27 19:23:26.700772	{"1": 5, "2": 5, "3": 5, "4": 999, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 999, "expected": 148, "difference": -851, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1364.00	\N	2025-08-27 19:23:26.700772	5	5	5
28	2025-08-27 19:28:42.709217	{"1": 5, "2": 5, "3": 5, "4": 1000, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 1000, "expected": 148, "difference": -852, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1365.00	\N	2025-08-27 19:28:42.709217	5	5	5
29	2025-08-27 19:32:03.907312	{"1": 5, "2": 5, "3": 5, "4": 998, "5": 0, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 998, "expected": 148, "difference": -850, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 177, "difference": 177, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1368.00	\N	2025-08-27 19:32:03.907312	5	5	5
30	2025-08-27 19:35:45.860409	{"1": 5, "2": 100, "3": 7, "4": 999, "5": 900, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 100, "expected": 48, "difference": -52, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 7, "expected": 93, "difference": 86, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 999, "expected": 148, "difference": -851, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "excess", "actual": 900, "expected": 177, "difference": -723, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1922.00	\N	2025-08-27 19:35:45.860409	5	5	5
31	2025-08-27 19:40:31.513736	{"1": 5, "2": 500, "3": 5, "4": 1000, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 500, "expected": 48, "difference": -452, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 1000, "expected": 148, "difference": -852, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1774.00	\N	2025-08-27 19:40:31.513736	5	5	5
32	2025-08-27 19:40:31.786846	{"1": 5, "2": 500, "3": 5, "4": 1000, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 500, "expected": 48, "difference": -452, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 1000, "expected": 148, "difference": -852, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	1774.00	\N	2025-08-27 19:40:31.786846	5	5	5
33	2025-08-27 19:46:29.913354	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	656.00	\N	2025-08-27 19:46:29.913354	5	5	5
34	2025-08-27 19:46:30.163977	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 63, "difference": 58, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 48, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 177, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 157, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}}	656.00	\N	2025-08-27 19:46:30.163977	5	5	5
35	2025-08-27 19:54:21.985607	{"1": 234, "2": 69, "3": 78, "4": 500, "5": 69, "6": 55}	{"1": {"type": "excess", "actual": 234, "expected": 62, "difference": -172, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 69, "expected": 47, "difference": -22, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 78, "expected": 93, "difference": 15, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 500, "expected": 148, "difference": -352, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 69, "expected": 176, "difference": 107, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 55, "expected": 156, "difference": 101, "productName": "Dry-Shift Hash", "productType": "Hash"}}	769.00	\N	2025-08-27 19:54:21.985607	48	5	5
36	2025-08-27 19:54:22.287927	{"1": 234, "2": 69, "3": 78, "4": 500, "5": 69, "6": 55}	{"1": {"type": "excess", "actual": 234, "expected": 62, "difference": -172, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "excess", "actual": 69, "expected": 47, "difference": -22, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 78, "expected": 93, "difference": 15, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "excess", "actual": 500, "expected": 148, "difference": -352, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 69, "expected": 176, "difference": 107, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 55, "expected": 156, "difference": 101, "productName": "Dry-Shift Hash", "productType": "Hash"}}	769.00	\N	2025-08-27 19:54:22.287927	48	5	5
37	2025-08-27 19:56:16.06345	{"1": 5, "2": 2, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 2, "expected": 47, "difference": 45, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 176, "difference": 171, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	655.00	\N	2025-08-27 19:56:16.06345	5	5	5
38	2025-08-27 19:56:16.459337	{"1": 5, "2": 2, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 2, "expected": 47, "difference": 45, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 176, "difference": 171, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	655.00	\N	2025-08-27 19:56:16.459337	5	5	5
39	2025-08-27 20:07:34.328717	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 4, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 47, "difference": 42, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 4, "expected": 176, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	653.00	\N	2025-08-27 20:07:34.328717	5	5	5
40	2025-08-27 20:07:34.574511	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 4, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 47, "difference": 42, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 4, "expected": 176, "difference": 172, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	653.00	\N	2025-08-27 20:07:34.574511	5	5	5
41	2025-08-27 20:13:50.755175	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 1, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 47, "difference": 42, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 1, "expected": 176, "difference": 175, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	656.00	\N	2025-08-27 20:13:50.755175	5	5	5
42	2025-08-27 20:13:51.009398	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 1, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 62, "difference": 57, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 47, "difference": 42, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 148, "difference": 143, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 1, "expected": 176, "difference": 175, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}}	656.00	\N	2025-08-27 20:13:51.009398	5	5	5
43	2025-08-27 22:33:14.168014	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 144, "difference": 139, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	613.00	\N	2025-08-27 22:33:14.168014	5	5	5
44	2025-08-27 22:33:14.474702	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 144, "difference": 139, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	613.00	\N	2025-08-27 22:33:14.474702	5	5	5
45	2025-08-27 22:35:56.022237	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 0}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 143, "difference": 138, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}}	617.00	\N	2025-08-27 22:35:56.022237	5	5	5
46	2025-08-27 22:35:56.264115	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 0}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 143, "difference": 138, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}}	617.00	\N	2025-08-27 22:35:56.264115	5	5	5
47	2025-08-27 22:57:11.212324	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 2}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 143, "difference": 138, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 2, "expected": 155, "difference": 153, "productName": "Dry-Shift Hash", "productType": "Hash"}}	615.00	\N	2025-08-27 22:57:11.212324	5	5	5
48	2025-08-27 22:57:11.550452	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 2}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 143, "difference": 138, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 2, "expected": 155, "difference": 153, "productName": "Dry-Shift Hash", "productType": "Hash"}}	615.00	\N	2025-08-27 22:57:11.550452	5	5	5
49	2025-08-27 22:58:05.30986	{"1": 5, "2": 5, "3": 5, "4": 10, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 10, "expected": 143, "difference": 133, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	607.00	\N	2025-08-27 22:58:05.30986	5	5	5
50	2025-08-27 22:58:05.620201	{"1": 5, "2": 5, "3": 5, "4": 10, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 10, "expected": 143, "difference": 133, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 168, "difference": 163, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	607.00	\N	2025-08-27 22:58:05.620201	5	5	5
51	2025-08-28 11:10:38.62538	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 167, "difference": 162, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	610.00	\N	2025-08-28 11:10:38.62538	5	5	5
52	2025-08-28 11:10:38.890119	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 37, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 167, "difference": 162, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	610.00	\N	2025-08-28 11:10:38.890119	5	5	5
53	2025-08-28 11:12:02.892164	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	608.00	\N	2025-08-28 11:12:02.892164	5	5	5
54	2025-08-28 11:12:03.199729	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}}	608.00	\N	2025-08-28 11:12:03.199729	5	5	5
55	2025-08-28 11:45:47.808513	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "test", "productType": "Cannabis"}}	609.00	\N	2025-08-28 11:45:47.808513	5	5	5
56	2025-08-28 11:45:48.165203	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "test", "productType": "Cannabis"}}	609.00	\N	2025-08-28 11:45:48.165203	5	5	5
57	2025-08-31 19:14:58.60639	{"1": 30, "2": 43, "3": 93, "4": 142, "5": 163, "6": 155, "7": 5}	{"1": {"type": "missing", "actual": 30, "expected": 35, "difference": 5, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 43, "expected": 46, "difference": 3, "productName": "Blue Dream", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 163, "expected": 164, "difference": 1, "productName": "Moroccan Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "StarDog", "productType": "Cannabis"}}	10.00	\N	2025-08-31 19:14:58.60639	500	10	40
58	2025-08-31 19:14:58.938671	{"1": 30, "2": 43, "3": 93, "4": 142, "5": 163, "6": 155, "7": 5}	{"1": {"type": "missing", "actual": 30, "expected": 35, "difference": 5, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 43, "expected": 46, "difference": 3, "productName": "Blue Dream", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 163, "expected": 164, "difference": 1, "productName": "Moroccan Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "StarDog", "productType": "Cannabis"}}	10.00	\N	2025-08-31 19:14:58.938671	500	10	40
59	2025-09-01 19:17:00.979314	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 45, "difference": 40, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 90, "difference": 85, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	613.00	\N	2025-09-01 19:17:00.979314	5	5	5
60	2025-09-01 19:17:01.228079	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 45, "difference": 40, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 90, "difference": 85, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	613.00	\N	2025-09-01 19:17:01.228079	5	5	5
61	2025-09-01 19:18:00.10061	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 45, "difference": 40, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	612.00	\N	2025-09-01 19:18:00.10061	5	5	5
62	2025-09-01 19:18:00.447776	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 45, "difference": 40, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	612.00	\N	2025-09-01 19:18:00.447776	5	5	5
63	2025-09-01 19:47:57.841838	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 1, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 1, "expected": 156, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	616.00	\N	2025-09-01 19:47:57.841838	9	1	2
64	2025-09-01 19:47:58.110843	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 1, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 1, "expected": 156, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	616.00	\N	2025-09-01 19:47:58.110843	9	1	2
65	2025-09-01 19:49:00.744037	{"1": 5, "2": 3, "3": 5, "4": 2, "5": 5, "6": 4, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 3, "expected": 46, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 2, "expected": 139, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 4, "expected": 156, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	618.00	\N	2025-09-01 19:49:00.744037	5	5	5
66	2025-09-01 19:49:01.047422	{"1": 5, "2": 3, "3": 5, "4": 2, "5": 5, "6": 4, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 3, "expected": 46, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 2, "expected": 139, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 4, "expected": 156, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	618.00	\N	2025-09-01 19:49:01.047422	5	5	5
67	2025-09-01 19:55:40.114503	{"1": 5, "2": 5, "3": 0, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 89, "difference": 89, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	617.00	\N	2025-09-01 19:55:40.114503	4	5	5
68	2025-09-01 19:55:40.365147	{"1": 5, "2": 5, "3": 0, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 89, "difference": 89, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	617.00	\N	2025-09-01 19:55:40.365147	4	5	5
69	2025-09-02 09:30:57.041646	{"1": 5, "2": 2, "3": 5, "4": 5, "5": 5, "6": 0, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 2, "expected": 46, "difference": 44, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 156, "difference": 156, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	620.00	\N	2025-09-02 09:30:57.041646	3	5	1
70	2025-09-02 09:30:57.422614	{"1": 5, "2": 2, "3": 5, "4": 5, "5": 5, "6": 0, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 2, "expected": 46, "difference": 44, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 156, "difference": 156, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	620.00	\N	2025-09-02 09:30:57.422614	3	5	1
71	2025-09-02 09:38:06.818903	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 3, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 3, "expected": 163, "difference": 160, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	614.00	\N	2025-09-02 09:38:06.818903	4	5	5
72	2025-09-02 09:38:07.283429	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 3, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 44, "difference": 39, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 3, "expected": 163, "difference": 160, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	614.00	\N	2025-09-02 09:38:07.283429	4	5	5
73	2025-09-02 09:58:28.369174	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 43, "difference": 38, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	611.00	\N	2025-09-02 09:58:28.369174	5	5	5
74	2025-09-02 09:58:28.780167	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 43, "difference": 38, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 89, "difference": 84, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}}	611.00	\N	2025-09-02 09:58:28.780167	5	5	5
75	2025-09-02 10:16:21.114307	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "9": 2}	{"1": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "9": {"type": "missing", "actual": 2, "expected": 100, "difference": 98, "productName": "test123", "productType": "Cannabis"}}	766.00	\N	2025-09-02 10:16:21.114307	5	5	5
76	2025-09-02 10:16:21.510146	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "9": 2}	{"1": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "9": {"type": "missing", "actual": 2, "expected": 100, "difference": 98, "productName": "test123", "productType": "Cannabis"}}	766.00	\N	2025-09-02 10:16:21.510146	5	5	5
77	2025-09-02 17:00:42.544306	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 4, "7": 5, "20": 5}	{"1": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 4, "expected": 156, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "excess", "actual": 5, "expected": 1, "difference": -4, "productName": "wax", "productType": "Wax"}}	632.00	\N	2025-09-02 17:00:42.544306	5	5	5
78	2025-09-02 17:00:42.886324	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 4, "7": 5, "20": 5}	{"1": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 4, "expected": 156, "difference": 152, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "excess", "actual": 5, "expected": 1, "difference": -4, "productName": "wax", "productType": "Wax"}}	632.00	\N	2025-09-02 17:00:42.886324	5	5	5
79	2025-09-02 18:01:42.125028	{"1": 0, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 1, "22": 5, "23": 5}	{"1": {"type": "missing", "actual": 0, "expected": 49, "difference": 49, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 1, "expected": 500, "difference": 499, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "vapes", "productType": "Vapes"}}	1176.00	\N	2025-09-02 18:01:42.125028	5	5	5
80	2025-09-02 18:01:42.493588	{"1": 0, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 1, "22": 5, "23": 5}	{"1": {"type": "missing", "actual": 0, "expected": 49, "difference": 49, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 1, "expected": 500, "difference": 499, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 4, "difference": -1, "productName": "vapes", "productType": "Vapes"}}	1176.00	\N	2025-09-02 18:01:42.493588	5	5	5
81	2025-09-02 18:06:41.858399	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 4, "20": 5, "22": 5, "23": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 4, "expected": 0, "difference": -4, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}}	1166.00	\N	2025-09-02 18:06:41.858399	5	5	5
82	2025-09-02 18:06:42.125336	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 4, "20": 5, "22": 5, "23": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 156, "difference": 151, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 4, "expected": 0, "difference": -4, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}}	1166.00	\N	2025-09-02 18:06:42.125336	5	5	5
83	2025-09-02 20:29:05.775723	{"1": 3, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 3, "expected": 49, "difference": 46, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1182.50	\N	2025-09-02 20:29:05.775723	80	5	5
84	2025-09-02 20:29:06.098636	{"1": 3, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 3, "expected": 49, "difference": 46, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1182.50	\N	2025-09-02 20:29:06.098636	80	5	5
85	2025-09-02 20:29:36.032192	{"1": 3, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 3, "expected": 49, "difference": 46, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1182.50	\N	2025-09-02 20:29:36.032192	80	5	5
86	2025-09-02 20:29:36.303957	{"1": 3, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 3, "expected": 49, "difference": 46, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1182.50	\N	2025-09-02 20:29:36.303957	80	5	5
87	2025-09-02 20:33:18.241502	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 2, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 2, "expected": 155.5, "difference": 153.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1183.50	\N	2025-09-02 20:33:18.241502	80	5	5
89	2025-09-02 20:34:41.183478	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 4, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 4, "expected": 155.5, "difference": 151.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1181.50	\N	2025-09-02 20:34:41.183478	250	5	5
91	2025-09-02 20:41:06.529548	{"1": 5, "3": 5, "4": 5, "5": 12, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 12, "expected": 163, "difference": 151, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1173.50	\N	2025-09-02 20:41:06.529548	80	5	5
93	2025-09-02 23:28:54.270241	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1180.50	\N	2025-09-02 23:28:54.270241	4	1	1
95	2025-09-02 23:33:04.344404	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1180.50	\N	2025-09-02 23:33:04.344404	90	5	5
97	2025-09-03 09:18:06.665494	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1180.50	\N	2025-09-03 09:18:06.665494	4	5	5
99	2025-09-03 09:37:48.092258	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1180.50	\N	2025-09-03 09:37:48.092258	4	5	5
101	2025-09-03 09:42:32.412643	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1180.50	\N	2025-09-03 09:42:32.412643	4	5	5
103	2025-09-03 09:46:07.820609	{"1": 5, "3": 4, "4": 5, "5": 5, "6": 5, "7": 5, "20": 5, "22": 5, "23": 5, "24": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 4, "expected": 139, "difference": 135, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 5, "expected": 0, "difference": -5, "productName": "StarDog", "productType": "Cannabis"}, "20": {"type": "missing", "actual": 5, "expected": 499, "difference": 494, "productName": "wax", "productType": "Wax"}, "22": {"type": "missing", "actual": 5, "expected": 50, "difference": 45, "productName": "edibles", "productType": "Edibles"}, "23": {"type": "excess", "actual": 5, "expected": 3, "difference": -2, "productName": "vapes", "productType": "Vapes"}, "24": {"type": "missing", "actual": 5, "expected": 19, "difference": 14, "productName": "weed", "productType": "Cannabis"}}	1181.50	\N	2025-09-03 09:46:07.820609	5	5	5
105	2025-09-03 10:06:02.037916	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 49, "difference": 44, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 139, "difference": 134, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}}	620.50	\N	2025-09-03 10:06:02.037916	5	5	5
107	2025-09-28 08:56:04.995826	{"1": 1, "3": 5, "4": 5, "5": 5, "6": 5, "26": 5, "27": 5, "28": 5, "29": 5}	{"1": {"type": "missing", "actual": 1, "expected": 80.5, "difference": 79.5, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 138, "difference": 133, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 139, "difference": 139, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "26": {"type": "missing", "actual": 5, "expected": 99, "difference": 94, "productName": "vapes2", "productType": "Vapes"}, "27": {"type": "missing", "actual": 5, "expected": 100.5, "difference": 95.5, "productName": "Test Product 3", "productType": "Cannabis"}, "28": {"type": "missing", "actual": 5, "expected": 200.5, "difference": 195.5, "productName": "Final Test Product", "productType": "Cannabis"}, "29": {"type": "missing", "actual": 5, "expected": 100, "difference": 95, "productName": "Working Product", "productType": "Cannabis"}}	1140.00	\N	2025-09-28 08:56:04.995826	5	5	5
108	2025-09-28 08:56:05.283921	{"1": 1, "3": 5, "4": 5, "5": 5, "6": 5, "26": 5, "27": 5, "28": 5, "29": 5}	{"1": {"type": "missing", "actual": 1, "expected": 80.5, "difference": 79.5, "productName": "Zkittlez", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 138, "difference": 133, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 139, "difference": 139, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 163, "difference": 158, "productName": "Moroccan Hash 2", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155.5, "difference": 150.5, "productName": "Dry-Shift Hash", "productType": "Hash"}, "26": {"type": "missing", "actual": 5, "expected": 99, "difference": 94, "productName": "vapes2", "productType": "Vapes"}, "27": {"type": "missing", "actual": 5, "expected": 100.5, "difference": 95.5, "productName": "Test Product 3", "productType": "Cannabis"}, "28": {"type": "missing", "actual": 5, "expected": 200.5, "difference": 195.5, "productName": "Final Test Product", "productType": "Cannabis"}, "29": {"type": "missing", "actual": 5, "expected": 100, "difference": 95, "productName": "Working Product", "productType": "Cannabis"}}	1140.00	\N	2025-09-28 08:56:05.283921	5	5	5
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shifts (id, shift_id, worker_name, start_time, end_time, status, shift_date, total_sales, total_expenses, net_amount, stock_discrepancies, reconciliation_id, notes, created_at, starting_till_amount) FROM stdin;
55	SHIFT 02/09/2025 - 3	test	2025-09-02 09:43:39.644226	2025-09-02 09:58:28.962	completed	2025-09-02	12.00	0.00	12.00	611.00	74	\N	2025-09-02 09:43:39.644226	10
56	SHIFT 02/09/2025 - 4	test	2025-09-02 10:11:44.701114	2025-09-02 10:16:21.671	completed	2025-09-02	120.00	0.00	120.00	766.00	76	\N	2025-09-02 10:11:44.701114	500
57	SHIFT 02/09/2025 - 5	5	2025-09-02 11:20:14.854511	2025-09-02 17:00:43.102	completed	2025-09-02	40.00	0.00	40.00	632.00	78	\N	2025-09-02 11:20:14.854511	5
34	SHIFT 27/08/2025 - 16	5	2025-08-27 19:40:19.098455	2025-08-27 19:40:31.96	completed	2025-08-27	0.00	0.00	0.00	1774.00	32	\N	2025-08-27 19:40:19.098455	5
35	SHIFT 27/08/2025 - 17	test	2025-08-27 19:46:09.934103	2025-08-27 19:46:30.343	completed	2025-08-27	0.00	5.00	-5.00	656.00	34	\N	2025-08-27 19:46:09.934103	10
36	SHIFT 27/08/2025 - 18	hello	2025-08-27 19:51:22.604513	2025-08-27 19:54:22.45	completed	2025-08-27	44.00	1.00	43.00	769.00	36	\N	2025-08-27 19:51:22.604513	5
37	SHIFT 27/08/2025 - 19	r	2025-08-27 19:55:45.555948	2025-08-27 19:56:16.632	completed	2025-08-27	0.00	22.00	-22.00	655.00	38	\N	2025-08-27 19:55:45.555948	5
38	SHIFT 27/08/2025 - 20	test	2025-08-27 20:07:18.80269	2025-08-27 20:07:34.745	completed	2025-08-27	0.00	5.00	-5.00	653.00	40	\N	2025-08-27 20:07:18.80269	5
39	SHIFT 27/08/2025 - 21	5	2025-08-27 20:13:40.969353	2025-08-27 20:13:51.174	completed	2025-08-27	0.00	0.00	0.00	656.00	42	\N	2025-08-27 20:13:40.969353	5
40	SHIFT 27/08/2025 - 22	5	2025-08-27 20:30:50.451663	2025-08-27 22:33:14.65	completed	2025-08-27	454.00	0.00	454.00	613.00	44	\N	2025-08-27 20:30:50.451663	5
41	SHIFT 27/08/2025 - 23	test	2025-08-27 22:34:31.760492	2025-08-27 22:35:56.433	completed	2025-08-27	15.00	0.00	15.00	617.00	46	\N	2025-08-27 22:34:31.760492	5
42	SHIFT 27/08/2025 - 24	5	2025-08-27 22:38:45.642182	2025-08-27 22:57:11.717	completed	2025-08-27	0.00	5.00	-5.00	615.00	48	\N	2025-08-27 22:38:45.642182	5
43	SHIFT 27/08/2025 - 25	5555	2025-08-27 22:57:27.741133	2025-08-27 22:58:05.79	completed	2025-08-27	0.00	5.00	-5.00	607.00	50	\N	2025-08-27 22:57:27.741133	55555
44	SHIFT 28/08/2025	test	2025-08-28 10:25:23.56293	2025-08-28 11:10:39.06	completed	2025-08-28	27.00	0.00	27.00	610.00	52	\N	2025-08-28 10:25:23.56293	5
45	SHIFT 28/08/2025 - 2	test	2025-08-28 11:11:04.107493	2025-08-28 11:12:03.377	completed	2025-08-28	12.00	0.00	12.00	608.00	54	\N	2025-08-28 11:11:04.107493	5
46	SHIFT 28/08/2025 - 3	5	2025-08-28 11:44:49.631147	2025-08-28 11:45:48.331	completed	2025-08-28	10.00	0.00	10.00	609.00	56	\N	2025-08-28 11:44:49.631147	5
47	SHIFT 31/08/2025	John	2025-08-31 19:07:21.194258	2025-08-31 19:14:59.123	completed	2025-08-31	36.00	10.00	26.00	10.00	58	\N	2025-08-31 19:07:21.194258	500
48	SHIFT 01/09/2025	decland	2025-09-01 19:12:48.318233	2025-09-01 19:17:01.389	completed	2025-09-01	50.00	0.00	50.00	613.00	60	\N	2025-09-01 19:12:48.318233	500
49	SHIFT 01/09/2025 - 2	5	2025-09-01 19:17:40.936302	2025-09-01 19:18:00.609	completed	2025-09-01	10.00	0.00	10.00	612.00	62	\N	2025-09-01 19:17:40.936302	5
50	SHIFT 01/09/2025 - 3	5	2025-09-01 19:26:17.472497	2025-09-01 19:47:58.271	completed	2025-09-01	12.00	7.00	5.00	616.00	64	\N	2025-09-01 19:26:17.472497	5
51	SHIFT 01/09/2025 - 4	ttt	2025-09-01 19:48:37.672182	2025-09-01 19:49:01.21	completed	2025-09-01	0.00	5.00	-5.00	618.00	66	\N	2025-09-01 19:48:37.672182	10
52	SHIFT 01/09/2025 - 5	10	2025-09-01 19:55:21.02761	2025-09-01 19:55:40.545	completed	2025-09-01	0.00	5.00	-5.00	617.00	68	\N	2025-09-01 19:55:21.02761	10
53	SHIFT 02/09/2025	5	2025-09-02 09:30:27.020531	2025-09-02 09:30:57.588	completed	2025-09-02	0.00	1.00	-1.00	620.00	70	\N	2025-09-02 09:30:27.020531	5
54	SHIFT 02/09/2025 - 2	test	2025-09-02 09:37:41.273054	2025-09-02 09:38:07.449	completed	2025-09-02	0.00	5.00	-5.00	614.00	72	\N	2025-09-02 09:37:41.273054	10
58	SHIFT 02/09/2025 - 6	test	2025-09-02 17:04:14.219611	2025-09-02 18:01:42.669	completed	2025-09-02	38.00	0.00	38.00	1176.00	80	\N	2025-09-02 17:04:14.219611	50
59	SHIFT 02/09/2025 - 7	5	2025-09-02 18:05:57.786562	2025-09-02 18:06:42.53	completed	2025-09-02	15.00	5.00	10.00	1166.00	82	\N	2025-09-02 18:05:57.786562	5
70	SHIFT 03/09/2025 - 6	Test	2025-09-03 23:01:54.14721	2025-09-28 08:56:05.617	completed	2025-09-03	0.00	0.00	0.00	1140.00	108	\N	2025-09-03 23:01:54.14721	500
60	SHIFT 02/09/2025 - 8	test	2025-09-02 20:11:42.815202	2025-09-02 20:33:18.741	completed	2025-09-02	5.00	500.00	-495.00	1183.50	\N	\N	2025-09-02 20:11:42.815202	5
\.


--
-- Data for Name: stock_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_logs (id, shift_id, product_id, action_type, worker_name, action_date, product_name, old_values, new_values, quantity_changed, location_from, location_to, notes, metadata, created_at) FROM stdin;
48	70	\N	product_created	TestWorker	2025-09-04 12:21:44.978317	Working Product	\N	{"onShelfGrams": "100.00", "externalGrams": "25.00", "internalGrams": "50.00"}	\N	\N	\N	New product created with initial stock	\N	2025-09-04 12:21:44.978317
46	70	\N	product_created	TestWorker	2025-09-04 12:21:10.800213	Final Test Product	\N	{"onShelfGrams": "200.50", "externalGrams": "50.00", "internalGrams": "75.25"}	\N	\N	\N	New product created with initial stock	\N	2025-09-04 12:21:10.800213
49	70	\N	product_deleted	Admin	2025-09-28 09:48:28.596	Final Test Product	{"id": 28, "name": "Final Test Product", "costPrice": "0", "shelfPrice": "0", "productType": "Cannabis", "onShelfGrams": "200.50", "externalGrams": "50.00", "internalGrams": "75.25"}	{"status": "deleted"}	\N	\N	\N	Product "Final Test Product" (ID: 28) has been deleted from inventory	\N	2025-09-28 09:48:28.606777
50	70	\N	product_deleted	Admin	2025-09-28 09:48:31.395	Working Product	{"id": 29, "name": "Working Product", "costPrice": "0", "shelfPrice": "0", "productType": "Cannabis", "onShelfGrams": "100.00", "externalGrams": "25.00", "internalGrams": "50.00"}	{"status": "deleted"}	\N	\N	\N	Product "Working Product" (ID: 29) has been deleted from inventory	\N	2025-09-28 09:48:31.406
45	70	\N	product_created	TestWorker	2025-09-04 12:19:42.484952	Test Product 3	\N	{"onShelfGrams": "100.50", "externalGrams": "25.00", "internalGrams": "50.25"}	\N	\N	\N	New product created with initial stock	\N	2025-09-04 12:19:42.484952
51	70	\N	product_deleted	Admin	2025-09-28 09:48:35.743	Test Product 3	{"id": 27, "name": "Test Product 3", "costPrice": "0", "shelfPrice": "0", "productType": "Cannabis", "onShelfGrams": "100.50", "externalGrams": "25.00", "internalGrams": "50.25"}	{"status": "deleted"}	\N	\N	\N	Product "Test Product 3" (ID: 27) has been deleted from inventory	\N	2025-09-28 09:48:35.753163
52	70	\N	product_deleted	Admin	2025-09-28 09:48:40.539	Moroccan Hash 2	{"id": 5, "name": "Moroccan Hash 2", "costPrice": "8.50", "shelfPrice": "12.00", "productType": "Hash", "onShelfGrams": "163.00", "externalGrams": "70.00", "internalGrams": "40.00"}	{"status": "deleted"}	\N	\N	\N	Product "Moroccan Hash 2" (ID: 5) has been deleted from inventory	\N	2025-09-28 09:48:40.549428
43	\N	26	product_created	dec	2025-09-03 10:24:14.328458	vapes2	\N	{"costPrice": "9", "shelfPrice": "9", "onShelfGrams": 99, "externalGrams": 0, "internalGrams": 0}	\N	\N	\N	New product created with initial stock	\N	2025-09-03 10:24:14.328458
44	70	1	product_edited	TestWorker	2025-09-04 12:18:36.196814	Zkittlez	{"costPrice": "8.00", "dealPrice": null, "shelfPrice": "12.00", "onShelfGrams": "49.00", "externalGrams": "35.00", "internalGrams": "38.00"}	{"costPrice": "8.00", "dealPrice": null, "shelfPrice": "12.00", "onShelfGrams": 75.25, "externalGrams": 10, "internalGrams": 25.75}	\N	\N	\N	Product stock and pricing updated	\N	2025-09-04 12:18:36.196814
47	70	1	stock_movement	TestWorker	2025-09-04 12:21:42.463747	Zkittlez	{"onShelfGrams": "75.25", "externalGrams": "10.00", "internalGrams": "25.75"}	{"onShelfGrams": "80.5", "externalGrams": "10.00", "internalGrams": "20.5"}	\N	\N	\N	5.25g moved from internal to shelf - Test after restart	\N	2025-09-04 12:21:42.463747
\.


--
-- Data for Name: stock_logs_decimal; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_logs_decimal (id, stock_log_id, quantity_changed_decimal, created_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_movements (id, product_id, from_location, to_location, quantity, worker_name, movement_date, notes, created_at, quantity_decimal) FROM stdin;
1	1	external	internal	50	dec	2025-09-01 21:00:43		2025-09-01 19:00:44.828007	\N
2	1	internal	shelf	10	dec	2025-09-01 21:01:33		2025-09-01 19:01:34.403945	\N
3	6	internal	shelf	1	dec	2025-09-01 21:36:06		2025-09-01 19:36:10.258583	\N
4	3	internal	shelf	50	dec	2025-09-02 12:15:26		2025-09-02 10:15:28.87717	\N
9	1	internal	shelf	5	TestWorker	2025-09-04 12:21:42	Test after restart	2025-09-04 12:21:42.342494	5.25
\.


--
-- Data for Name: stock_movements_decimal; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_movements_decimal (id, stock_movement_id, quantity_decimal, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, phone_number, date_of_birth, address, profile_image_url, id_image_url, is_onboarded, onboarding_data, created_at, membership_status, approval_date, expiry_date, approved_by, renewal_count, last_active, id_back_image_url, role, is_banned, banned_by, banned_at, ban_reason) FROM stdin;
22	test123!@gmail.com	test123						\N	\N	f	\N	2025-09-28 09:47:42.418097	pending	\N	\N	\N	0	\N	\N	\N	f	\N	\N	\N
1	demo@member.com	demo123	John	Doe	+44 7700 900123	1990-01-15	123 Demo Street, London, UK	\N	\N	t	\N	2025-08-26 19:23:26.75159	approved	2025-08-26 21:57:21.551	2026-08-26 21:57:21.551	System Migration	0	2025-09-28 11:22:23.417	\N	\N	f	\N	\N	\N
23	jack123@gmail.com	test123						\N	\N	f	\N	2025-09-28 11:22:46.437987	pending	\N	\N	\N	0	\N	\N	\N	f	\N	\N	\N
2	admin123@gmail.com	admin123	tom	tom	+341241224	2025-08-06	tom	\N	\N	t	\N	2025-08-26 19:23:26.75159	approved	2025-08-26 21:57:21.551	2026-08-26 21:57:21.551	System Migration	0	\N	\N	superadmin	f	\N	\N	\N
21	test123@gmail.com	test123	Vincenzo	test	0610252060	2025-09-25	2, Benalmadena	\N	\N	t	\N	2025-09-01 19:52:34.740163	approved	2025-09-01 19:53:23.412	2026-09-01 19:53:23.412	Admin Panel	0	2025-09-01 19:53:33.474	\N	\N	f	\N	\N	\N
19	Tim123@gmail.com	tim123						\N	\N	f	\N	2025-08-28 12:35:49.3767	approved	2025-08-31 19:07:41.559	2026-08-31 19:07:41.559	Admin Panel	0	2025-09-01 18:12:45.672	\N	\N	f	\N	\N	\N
\.


--
-- Name: basket_items_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.basket_items_decimal_id_seq', 1, false);


--
-- Name: basket_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.basket_items_id_seq', 60, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.donations_id_seq', 39, true);


--
-- Name: email_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_reports_id_seq', 14, true);


--
-- Name: expense_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expense_payments_id_seq', 2, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expenses_id_seq', 39, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 66, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 29, true);


--
-- Name: shift_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_activities_id_seq', 208, true);


--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_reconciliations_id_seq', 108, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shifts_id_seq', 70, true);


--
-- Name: stock_logs_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_logs_decimal_id_seq', 1, false);


--
-- Name: stock_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_logs_id_seq', 52, true);


--
-- Name: stock_movements_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_movements_decimal_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 23, true);


--
-- Name: basket_items_decimal basket_items_decimal_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items_decimal
    ADD CONSTRAINT basket_items_decimal_pkey PRIMARY KEY (id);


--
-- Name: basket_items basket_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: email_reports email_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_reports
    ADD CONSTRAINT email_reports_pkey PRIMARY KEY (id);


--
-- Name: expense_payments expense_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_payments
    ADD CONSTRAINT expense_payments_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pickup_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pickup_code_unique UNIQUE (pickup_code);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_product_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_code_unique UNIQUE (product_code);


--
-- Name: shift_activities shift_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_activities
    ADD CONSTRAINT shift_activities_pkey PRIMARY KEY (id);


--
-- Name: shift_reconciliations shift_reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_reconciliations
    ADD CONSTRAINT shift_reconciliations_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_shift_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_shift_id_unique UNIQUE (shift_id);


--
-- Name: stock_logs_decimal stock_logs_decimal_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs_decimal
    ADD CONSTRAINT stock_logs_decimal_pkey PRIMARY KEY (id);


--
-- Name: stock_logs stock_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_pkey PRIMARY KEY (id);


--
-- Name: stock_movements_decimal stock_movements_decimal_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements_decimal
    ADD CONSTRAINT stock_movements_decimal_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: expense_payments_expense_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expense_payments_expense_id_idx ON public.expense_payments USING btree (expense_id);


--
-- Name: expense_payments_payment_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expense_payments_payment_date_idx ON public.expense_payments USING btree (payment_date);


--
-- Name: expense_payments_shift_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expense_payments_shift_id_idx ON public.expense_payments USING btree (shift_id);


--
-- Name: expenses_expense_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expenses_expense_date_idx ON public.expenses USING btree (expense_date);


--
-- Name: expenses_payment_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expenses_payment_status_idx ON public.expenses USING btree (payment_status);


--
-- Name: expenses_shift_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expenses_shift_id_idx ON public.expenses USING btree (shift_id);


--
-- Name: expenses_worker_name_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX expenses_worker_name_idx ON public.expenses USING btree (worker_name);


--
-- Name: stock_movements_movement_date_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_movements_movement_date_idx ON public.stock_movements USING btree (movement_date);


--
-- Name: stock_movements_product_id_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_movements_product_id_idx ON public.stock_movements USING btree (product_id);


--
-- Name: basket_items_decimal basket_items_decimal_basket_item_id_basket_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items_decimal
    ADD CONSTRAINT basket_items_decimal_basket_item_id_basket_items_id_fk FOREIGN KEY (basket_item_id) REFERENCES public.basket_items(id);


--
-- Name: basket_items basket_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: basket_items basket_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.basket_items
    ADD CONSTRAINT basket_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: donations donations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_reports email_reports_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_reports
    ADD CONSTRAINT email_reports_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: expense_payments expense_payments_expense_id_expenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_payments
    ADD CONSTRAINT expense_payments_expense_id_expenses_id_fk FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: expense_payments expense_payments_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expense_payments
    ADD CONSTRAINT expense_payments_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: expenses expenses_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: orders orders_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: shift_activities shift_activities_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_activities
    ADD CONSTRAINT shift_activities_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: shifts shifts_reconciliation_id_shift_reconciliations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_reconciliation_id_shift_reconciliations_id_fk FOREIGN KEY (reconciliation_id) REFERENCES public.shift_reconciliations(id);


--
-- Name: stock_logs_decimal stock_logs_decimal_stock_log_id_stock_logs_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs_decimal
    ADD CONSTRAINT stock_logs_decimal_stock_log_id_stock_logs_id_fk FOREIGN KEY (stock_log_id) REFERENCES public.stock_logs(id);


--
-- Name: stock_logs stock_logs_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_logs stock_logs_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: stock_movements_decimal stock_movements_decimal_stock_movement_id_stock_movements_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements_decimal
    ADD CONSTRAINT stock_movements_decimal_stock_movement_id_stock_movements_id_fk FOREIGN KEY (stock_movement_id) REFERENCES public.stock_movements(id);


--
-- Name: stock_movements stock_movements_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

