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

--
-- Name: _system; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA _system;


ALTER SCHEMA _system OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: replit_database_migrations_v1; Type: TABLE; Schema: _system; Owner: neondb_owner
--

CREATE TABLE _system.replit_database_migrations_v1 (
    id bigint NOT NULL,
    build_id text NOT NULL,
    deployment_id text NOT NULL,
    statement_count bigint NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE _system.replit_database_migrations_v1 OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE; Schema: _system; Owner: neondb_owner
--

CREATE SEQUENCE _system.replit_database_migrations_v1_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNER TO neondb_owner;

--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE OWNED BY; Schema: _system; Owner: neondb_owner
--

ALTER SEQUENCE _system.replit_database_migrations_v1_id_seq OWNED BY _system.replit_database_migrations_v1.id;


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
    payment_status text DEFAULT 'unpaid'::text,
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
    on_shelf_grams numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    internal_grams numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    external_grams numeric(10,2) DEFAULT '0'::numeric NOT NULL,
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
-- Name: replit_database_migrations_v1 id; Type: DEFAULT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1 ALTER COLUMN id SET DEFAULT nextval('_system.replit_database_migrations_v1_id_seq'::regclass);


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
-- Data for Name: replit_database_migrations_v1; Type: TABLE DATA; Schema: _system; Owner: neondb_owner
--

COPY _system.replit_database_migrations_v1 (id, build_id, deployment_id, statement_count, applied_at) FROM stdin;
1	d56c333b-3b24-4965-ab86-b4f6e319f7be	2658078b-a4b7-4078-a805-993664e7785e	44	2025-09-04 13:01:50.066543+00
\.


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
1	3	[{"id": 1, "userId": 3, "product": {"id": 7, "name": "chuckberry", "category": "Indica", "imageUrl": "", "isActive": true, "createdAt": "2025-08-29T22:29:58.768Z", "description": "", "productCode": "CB1234"}, "quantity": 1, "createdAt": "2025-08-31T20:18:08.470Z", "productId": 7}]	\N	34	pending	2025-08-31 20:18:12.930132
2	3	[{"id": 2, "userId": 3, "product": {"id": 7, "name": "chuckberry", "category": "Indica", "imageUrl": "", "isActive": true, "createdAt": "2025-08-29T22:29:58.768Z", "description": "", "productCode": "CB1234"}, "quantity": 1, "createdAt": "2025-08-31T20:20:15.782Z", "productId": 7}]	\N	34	pending	2025-08-31 20:20:28.709143
\.


--
-- Data for Name: email_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_reports (id, shift_id, report_type, subject, content, recipient_email, sent_at, shift_date, worker_name, metadata, created_at) FROM stdin;
5	8	shift_end	Shift Report - test - 11/09/2025	Worker: test\nShift - 11/09/2025 03:00 - 03:13\n\nDISPENSARY\nCannabis: ₳50 5g sold\n\nCUSTOM PRICING ORDERS: 1\nCode 1075: €50 (5g for 50)\n\nSTOCK DISCREPANCIES\nZkittlez: 26g missing\nBlue Dream: 41g missing\nLemon Haze: 88g missing\nWedding Cake: 137g missing\nMoroccan Hash: 161g missing\nDry-Shift Hash: 150g missing\nchuckberry: 38g missing\n\nMEMBER DETAILS\nNew members: 0\nAll members: 1\nActive members: 1\nRenewed members: 0\nExpired members: 0\n\nFINANCIAL SUMMARY\nEXPENSES\nCurrent Shift Expenses:\n  dwqa: ₳450 paid of ₳500 (partial)\n  chucberry 500g: ₳250 paid of ₳500 (partial)\nOutstanding from Previous Shifts: None\nTotal payments made this shift: ₳700.00\n\nStarting till: ₳0\nCash in till: ₳50\nNotes: 0\nCoins: 0\nTotal collections: ₳50.00\nNet total: ₳50.00\n\nMONEY RECONCILIATION\nExpected in till: ₳-650.00\nActual in till: ₳50.00\n₳700.00 excess\n\n	management@demo-social-club.com	2025-09-11 01:13:29.23567	11/09/2025	test	{"netAmount": "50.00", "totalSales": "50.00", "shiftEndTime": "03:13", "totalExpenses": "0.00", "shiftStartTime": "03:00", "stockDiscrepancies": "641.00"}	2025-09-11 01:13:29.23567
\.


--
-- Data for Name: expense_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expense_payments (id, expense_id, shift_id, payment_amount, payment_date, worker_name, notes, created_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, description, amount, worker_name, expense_date, created_at, shift_id, paid_amount, outstanding_amount, payment_status, last_payment_date) FROM stdin;
7	chucberry 500g	500	ku	2025-09-11 01:08:52.479232	2025-09-11 01:08:52.479232	8	250.00	250.00	partial	\N
8	dwqa	500	ce	2025-09-11 01:10:03.776688	2025-09-11 01:10:03.776688	8	450.00	50.00	partial	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, user_id, pickup_code, items, quantities, total_price, status, archived_from_admin, created_at, shift_id, custom_pricing_used, custom_description) FROM stdin;
1	\N	7313	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 25, "productId": 7}]	375	completed	t	2025-08-29 22:38:12.336755	1	f	\N
2	\N	2609	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 25, "productId": 7}]	375	completed	t	2025-08-29 23:01:50.025179	2	f	\N
3	3	7158	[{"name": "chuckberry", "category": "Indica", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 1, "productId": 7}]	34	pending	t	2025-08-31 20:18:12.903734	3	f	\N
4	3	1295	[{"name": "chuckberry", "category": "Indica", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 1, "productId": 7}]	34	completed	t	2025-08-31 20:20:28.684129	3	f	\N
5	\N	2446	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 5, "productId": 7}]	40	completed	f	2025-09-04 13:05:13.324299	5	t	5 for 30
6	\N	6923	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 5, "productId": 7}]	30	completed	f	2025-09-04 13:05:45.039537	5	t	tesr
7	\N	9567	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 1, "productId": 7}]	15	completed	f	2025-09-04 13:34:43.362897	6	f	\N
8	\N	2043	[{"name": "chuckberry", "category": "Cannabis", "productId": 7, "productCode": "CB1234"}]	[{"quantity": 1, "productId": 7}]	5	completed	f	2025-09-04 13:35:11.137743	6	t	test
9	\N	1075	[{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 5, "productId": 1}]	50	completed	f	2025-09-11 01:01:43.988031	8	t	5g for 50
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, image_url, category, product_type, product_code, stock_quantity, admin_price, supplier, on_shelf_grams, internal_grams, external_grams, cost_price, shelf_price, last_updated, is_active, created_at, worker_name, entry_date, jar_weight) FROM stdin;
2	Blue Dream	Popular Sativa-dominant hybrid with blueberry notes	/api/placeholder/300/200	Hybrid	Cannabis	BD7010	174	10	California Seeds Co	46.00	45.00	83.00	7.00	10.00	2025-08-28 16:07:42.681127	t	2025-08-28 16:07:42.681127	\N	\N	\N
3	Lemon Haze	Energizing Sativa with citrusy lemon aroma	/api/placeholder/300/200	Sativa	Cannabis	LH2213	216	13	Dutch Masters	93.00	60.00	63.00	9.00	13.00	2025-08-28 16:07:43.278995	t	2025-08-28 16:07:43.278995	\N	\N	\N
4	Wedding Cake	Relaxing Indica-dominant hybrid with vanilla undertones	/api/placeholder/300/200	Hybrid	Cannabis	WC9615	262	15	Wedding Growers	142.00	70.00	50.00	11.00	15.00	2025-08-28 16:07:43.301676	t	2025-08-28 16:07:43.301676	\N	\N	\N
5	Moroccan Hash	Traditional hash with earthy flavors	/api/placeholder/300/200	Indica	Hash	MH5812	276	12	Moroccan Imports	166.00	40.00	70.00	8.50	12.00	2025-08-28 16:07:43.32483	t	2025-08-28 16:07:43.32483	\N	\N	\N
6	Dry-Shift Hash	Premium sativa hash with clean taste	/api/placeholder/300/200	Sativa	Hash	DS1410	235	10	Alpine Hash Co	155.00	30.00	50.00	7.50	10.00	2025-08-28 16:07:43.347619	t	2025-08-28 16:07:43.347619	\N	\N	\N
7	chuckberry			Indica	Cannabis	CB1234	488	15	John	38.00	100.00	350.00	5	15	2025-09-04 13:35:11.197	t	2025-08-29 22:29:58.768014	dec	2025-09-04	50.00
1	Zkittlez	Premium indoor Indica strain with sweet fruity flavors	/api/placeholder/300/200	Indica	Cannabis	ZK4312	166	12	Premium Growers Ltd	31.00	50.00	85.00	8.00	12.00	2025-09-11 01:01:44.05	t	2025-08-28 16:07:42.578927	\N	\N	\N
8	test haze			Sativa	Cannabis	TESTH	1050	10	John	50.00	500.00	500.00	5	10	2025-09-11 01:03:29.711	t	2025-09-11 01:03:29.722457	jul	2025-09-11	500.00
\.


--
-- Data for Name: shift_activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_activities (id, shift_id, activity_type, activity_id, description, amount, "timestamp", metadata) FROM stdin;
26	8	shift_start	8	Shift started by test	\N	2025-09-11 01:00:25.318024	{"action": "start", "worker": "test"}
27	8	sale	\N	Manual order created: 1075	50	2025-09-11 01:01:44.244453	{"items": [{"name": "Zkittlez", "category": "Cannabis", "productId": 1, "productCode": "ZK4312"}], "manual": true, "pickupCode": "1075", "quantities": [{"quantity": 5, "productId": 1}]}
28	8	expense	7	Expense logged: chucberry 500g	500	2025-09-11 01:08:52.795789	{"worker": "ku", "description": "chucberry 500g"}
29	8	expense	8	Expense logged: dwqa	500	2025-09-11 01:10:03.983745	{"worker": "ce", "description": "dwqa"}
30	8	reconciliation	16	Stock reconciliation completed. 641.00 discrepancies found.	\N	2025-09-11 01:13:28.412262	{"products": 8, "discrepancies": "641.00", "reconciliationId": 16}
\.


--
-- Data for Name: shift_reconciliations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_reconciliations (id, shift_date, product_counts, discrepancies, total_discrepancies, admin_notes, created_at, cash_in_till, coins, notes_amount) FROM stdin;
1	2025-08-29 22:51:02.521009	{"7": 25}	{"1": {"type": "missing", "actual": 0, "expected": 36, "difference": 36, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 46, "difference": 46, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 93, "difference": 93, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 142, "difference": 142, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 166, "difference": 166, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}}	638.00	\N	2025-08-29 22:51:02.521009	370	0	0
2	2025-08-29 22:51:02.784756	{"7": 25}	{"1": {"type": "missing", "actual": 0, "expected": 36, "difference": 36, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 46, "difference": 46, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 93, "difference": 93, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 142, "difference": 142, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 166, "difference": 166, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}}	638.00	\N	2025-08-29 22:51:02.784756	370	0	0
3	2025-08-29 23:02:38.073457	{"7": 1}	{"1": {"type": "missing", "actual": 0, "expected": 36, "difference": 36, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 46, "difference": 46, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 93, "difference": 93, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 142, "difference": 142, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 166, "difference": 166, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 1, "expected": 0, "difference": -1, "productName": "chuckberry", "productType": "Cannabis"}}	639.00	\N	2025-08-29 23:02:38.073457	20	0	0
4	2025-08-29 23:02:38.373994	{"7": 1}	{"1": {"type": "missing", "actual": 0, "expected": 36, "difference": 36, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 46, "difference": 46, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 93, "difference": 93, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 142, "difference": 142, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 166, "difference": 166, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "excess", "actual": 1, "expected": 0, "difference": -1, "productName": "chuckberry", "productType": "Cannabis"}}	639.00	\N	2025-08-29 23:02:38.373994	20	0	0
5	2025-08-31 20:22:27.015983	{"1": 5, "2": 3, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 3, "expected": 46, "difference": 43, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 5, "expected": 9, "difference": 4, "productName": "chuckberry", "productType": "Cannabis"}}	614.00	\N	2025-08-31 20:22:27.015983	5	5	5
7	2025-09-04 13:03:50.072214	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 5, "expected": 9, "difference": 4, "productName": "chuckberry", "productType": "Cannabis"}}	612.00	\N	2025-09-04 13:03:50.072214	5	5	5
9	2025-09-04 13:06:25.598227	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 0, "expected": 40, "difference": 40, "productName": "chuckberry", "productType": "Cannabis"}}	648.00	\N	2025-09-04 13:06:25.598227	165	5	5
11	2025-09-04 13:37:14.052101	{"1": 4, "2": 5, "3": 55, "4": 5, "5": 5, "6": 5, "7": 37}	{"1": {"type": "missing", "actual": 4, "expected": 36, "difference": 32, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 55, "expected": 93, "difference": 38, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 0, "expected": 38, "difference": 38, "productName": "chuckberry", "productType": "Cannabis"}}	597.00	\N	2025-09-04 13:37:14.052101	120	5	5
13	2025-09-04 13:44:19.389897	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 87}	{"1": {"type": "missing", "actual": 5, "expected": 36, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 37, "expected": 38, "difference": 1, "productName": "chuckberry", "productType": "Cannabis"}}	609.00	\N	2025-09-04 13:44:19.389897	450	5	5
15	2025-09-11 01:13:27.939978	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "8": 550}	{"1": {"type": "missing", "actual": 5, "expected": 31, "difference": 26, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 0, "expected": 38, "difference": 38, "productName": "chuckberry", "productType": "Cannabis"}}	641.00	\N	2025-09-11 01:13:27.939978	50	0	0
16	2025-09-11 01:13:28.175476	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5, "7": 5, "8": 550}	{"1": {"type": "missing", "actual": 5, "expected": 31, "difference": 26, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 5, "expected": 46, "difference": 41, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 5, "expected": 93, "difference": 88, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 5, "expected": 142, "difference": 137, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 5, "expected": 166, "difference": 161, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 5, "expected": 155, "difference": 150, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 0, "expected": 38, "difference": 38, "productName": "chuckberry", "productType": "Cannabis"}}	641.00	\N	2025-09-11 01:13:28.175476	50	0	0
17	2025-09-11 01:15:06.43762	{"8": 500}	{"1": {"type": "missing", "actual": 0, "expected": 31, "difference": 31, "productName": "Zkittlez", "productType": "Cannabis"}, "2": {"type": "missing", "actual": 0, "expected": 46, "difference": 46, "productName": "Blue Dream", "productType": "Cannabis"}, "3": {"type": "missing", "actual": 0, "expected": 93, "difference": 93, "productName": "Lemon Haze", "productType": "Cannabis"}, "4": {"type": "missing", "actual": 0, "expected": 142, "difference": 142, "productName": "Wedding Cake", "productType": "Cannabis"}, "5": {"type": "missing", "actual": 0, "expected": 166, "difference": 166, "productName": "Moroccan Hash", "productType": "Hash"}, "6": {"type": "missing", "actual": 0, "expected": 155, "difference": 155, "productName": "Dry-Shift Hash", "productType": "Hash"}, "7": {"type": "missing", "actual": 0, "expected": 38, "difference": 38, "productName": "chuckberry", "productType": "Cannabis"}, "8": {"type": "missing", "actual": 0, "expected": 50, "difference": 50, "productName": "test haze", "productType": "Cannabis"}}	721.00	\N	2025-09-11 01:15:06.43762	0	0	0
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shifts (id, shift_id, worker_name, start_time, end_time, status, shift_date, total_sales, total_expenses, net_amount, stock_discrepancies, reconciliation_id, notes, created_at, starting_till_amount) FROM stdin;
1	SHIFT 29/08/2025	jul	2025-08-29 22:36:57.749038	2025-08-29 22:51:02.902	completed	2025-08-29	375.00	0.00	375.00	638.00	2	\N	2025-08-29 22:36:57.749038	200
2	SHIFT 29/08/2025 - 2	jul	2025-08-29 23:01:16.920028	2025-08-29 23:02:38.486	completed	2025-08-29	375.00	0.00	375.00	639.00	4	\N	2025-08-29 23:01:16.920028	20
3	SHIFT 31/08/2025	test	2025-08-31 20:16:07.234411	2025-08-31 20:22:27.416	completed	2025-08-31	34.00	5.00	29.00	614.00	\N	\N	2025-08-31 20:16:07.234411	500
4	SHIFT 03/09/2025	j	2025-09-03 22:25:40.859374	2025-09-04 13:03:50.682	completed	2025-09-03	0.00	0.00	0.00	612.00	\N	\N	2025-09-03 22:25:40.859374	0
5	SHIFT 04/09/2025	j	2025-09-04 13:04:45.251417	2025-09-04 13:06:26.204	completed	2025-09-04	70.00	0.00	70.00	648.00	\N	\N	2025-09-04 13:04:45.251417	500
6	SHIFT 04/09/2025 - 2	test	2025-09-04 13:33:58.252103	2025-09-04 13:37:14.579	completed	2025-09-04	20.00	0.00	20.00	597.00	\N	\N	2025-09-04 13:33:58.252103	500
8	SHIFT 11/09/2025	test	2025-09-11 01:00:25.272509	2025-09-11 01:13:28.375	completed	2025-09-11	50.00	0.00	50.00	641.00	16	\N	2025-09-11 01:00:25.272509	0
\.


--
-- Data for Name: stock_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_logs (id, shift_id, product_id, action_type, worker_name, action_date, product_name, old_values, new_values, quantity_changed, location_from, location_to, notes, metadata, created_at) FROM stdin;
2	8	8	product_created	jul	2025-09-11 01:03:29.786961	test haze	\N	{"costPrice": "5", "shelfPrice": "10", "onShelfGrams": 50, "externalGrams": 500, "internalGrams": 500}	\N	\N	\N	New product created with initial stock	\N	2025-09-11 01:03:29.786961
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
1	admin123@gmail.com	admin123	Admin	User	\N	\N	\N	\N	\N	t	\N	2025-08-28 12:46:34.729975	approved	\N	\N	\N	0	\N	\N	superadmin	f	\N	\N	\N
3	demo@member.com	demo123	John	Doe	\N	\N	\N	\N	\N	t	\N	2025-08-28 16:07:41.778949	approved	\N	\N	\N	0	2025-08-31 20:20:11.915	\N	\N	f	\N	\N	\N
4	schoullerjulien5@gmail.com	Test123						\N	\N	f	\N	2025-09-03 22:18:20.806669	approved	2025-09-03 22:22:46.222	2026-09-03 22:22:46.222	Admin Panel	0	\N	\N	\N	f	\N	\N	\N
\.


--
-- Name: replit_database_migrations_v1_id_seq; Type: SEQUENCE SET; Schema: _system; Owner: neondb_owner
--

SELECT pg_catalog.setval('_system.replit_database_migrations_v1_id_seq', 1, true);


--
-- Name: basket_items_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.basket_items_decimal_id_seq', 1, false);


--
-- Name: basket_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.basket_items_id_seq', 2, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.donations_id_seq', 2, true);


--
-- Name: email_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_reports_id_seq', 5, true);


--
-- Name: expense_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expense_payments_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expenses_id_seq', 8, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 9, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 8, true);


--
-- Name: shift_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_activities_id_seq', 30, true);


--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_reconciliations_id_seq', 17, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shifts_id_seq', 8, true);


--
-- Name: stock_logs_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_logs_decimal_id_seq', 1, false);


--
-- Name: stock_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_logs_id_seq', 2, true);


--
-- Name: stock_movements_decimal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_movements_decimal_id_seq', 1, false);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: replit_database_migrations_v1 replit_database_migrations_v1_pkey; Type: CONSTRAINT; Schema: _system; Owner: neondb_owner
--

ALTER TABLE ONLY _system.replit_database_migrations_v1
    ADD CONSTRAINT replit_database_migrations_v1_pkey PRIMARY KEY (id);


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
-- Name: idx_replit_database_migrations_v1_build_id; Type: INDEX; Schema: _system; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_replit_database_migrations_v1_build_id ON _system.replit_database_migrations_v1 USING btree (build_id);


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

