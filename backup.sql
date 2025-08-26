--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (84ade85)
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
-- Name: expenses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    description text NOT NULL,
    amount text NOT NULL,
    worker_name text NOT NULL,
    expense_date timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    shift_id integer
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
    created_at timestamp without time zone DEFAULT now()
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
    on_shelf_grams integer DEFAULT 0 NOT NULL,
    internal_grams integer DEFAULT 0 NOT NULL,
    external_grams integer DEFAULT 0 NOT NULL,
    cost_price text DEFAULT '0'::text NOT NULL,
    shelf_price text DEFAULT '0'::text NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
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
    total_discrepancies integer DEFAULT 0,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now()
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
    stock_discrepancies integer DEFAULT 0,
    reconciliation_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT now()
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
-- Name: donations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.donations ALTER COLUMN id SET DEFAULT nextval('public.donations_id_seq'::regclass);


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
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: basket_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.basket_items (id, user_id, product_id, quantity, created_at) FROM stdin;
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
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, description, amount, worker_name, expense_date, created_at, shift_id) FROM stdin;
1	test	20	dec	2025-08-26 19:39:01.371693	2025-08-26 19:39:01.371693	\N
8	test555	55	hiiiiiii55	2025-08-26 20:56:43.662296	2025-08-26 20:56:43.662296	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, user_id, pickup_code, items, quantities, total_price, status, archived_from_admin, created_at) FROM stdin;
1	1	4721	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 2, "productId": 1}]	24	completed	t	2025-08-26 19:23:48.939127
2	1	8935	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 3}]	23	completed	t	2025-08-26 19:23:48.939127
3	1	2164	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 3, "productId": 4}]	45	pending	t	2025-08-26 19:23:48.939127
4	1	4959	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 2, "productId": 1}, {"quantity": 2, "productId": 4}]	54	completed	t	2025-08-26 19:54:20.841171
5	1	7269	[{"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	22	completed	t	2025-08-26 19:55:13.955429
6	1	6714	[{"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 3}, {"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	35	completed	f	2025-08-26 21:18:58.100597
7	1	7155	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}, {"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}, {"name": "Moroccan Hash", "category": "Indica", "productId": 5, "productCode": "MH5812"}, {"name": "Dry-Shift Hash", "category": "Sativa", "productId": 6, "productCode": "DS1410"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 1}, {"quantity": 1, "productId": 4}, {"quantity": 1, "productId": 3}, {"quantity": 1, "productId": 5}, {"quantity": 1, "productId": 6}]	72	completed	f	2025-08-26 21:24:33.821238
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, image_url, category, product_type, product_code, stock_quantity, admin_price, supplier, on_shelf_grams, internal_grams, external_grams, cost_price, shelf_price, last_updated, is_active, created_at) FROM stdin;
2	Blue Dream	Popular Sativa-dominant hybrid with blueberry notes	/api/placeholder/300/200	Hybrid	Cannabis	BD7010	179	10	California Seeds Co	51	45	83	7.00	10.00	2025-08-26 21:25:37.727	t	2025-08-26 19:23:40.245968
1	Zkittlez	Premium indoor Indica strain with sweet fruity flavors	/api/placeholder/300/200	Indica	Cannabis	ZK4312	199	12	Premium Growers Ltd	64	50	85	8.00	12.00	2025-08-26 21:25:37.806	t	2025-08-26 19:23:40.245968
4	Wedding Cake	Relaxing Indica-dominant hybrid with vanilla undertones	/api/placeholder/300/200	Hybrid	Cannabis	WC9615	269	15	Wedding Growers	149	70	50	11.00	15.00	2025-08-26 21:25:37.883	t	2025-08-26 19:23:40.245968
3	Lemon Haze	Energizing Sativa with citrusy lemon aroma	/api/placeholder/300/200	Sativa	Cannabis	LH2213	218	13	Dutch Masters	95	60	63	9.00	13.00	2025-08-26 21:25:37.958	t	2025-08-26 19:23:40.245968
5	Moroccan Hash	Traditional hash with earthy flavors	/api/placeholder/300/200	Indica	Hash	MH5812	288	12	Moroccan Imports	178	40	70	8.50	12.00	2025-08-26 21:25:38.032	t	2025-08-26 19:23:40.245968
6	Dry-Shift Hash	Premium sativa hash with clean taste	/api/placeholder/300/200	Sativa	Hash	DS1410	238	10	Alpine Hash Co	158	30	50	7.50	10.00	2025-08-26 21:25:38.107	t	2025-08-26 19:23:40.245968
\.


--
-- Data for Name: shift_activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_activities (id, shift_id, activity_type, activity_id, description, amount, "timestamp", metadata) FROM stdin;
32	16	shift_start	16	Shift started by hi	\N	2025-08-26 21:27:16.060893	{"action": "start", "worker": "hi"}
33	16	reconciliation	\N	Stock reconciliation completed. 0 discrepancies found.	\N	2025-08-26 21:27:31.508638	{"products": 5}
34	17	shift_start	17	Shift started by again	\N	2025-08-26 21:27:41.460799	{"action": "start", "worker": "again"}
\.


--
-- Data for Name: shift_reconciliations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_reconciliations (id, shift_date, product_counts, discrepancies, total_discrepancies, admin_notes, created_at) FROM stdin;
1	2025-08-26 19:57:32.489963	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675	\N	2025-08-26 19:57:32.489963
2	2025-08-26 19:57:40.944119	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675	\N	2025-08-26 19:57:40.944119
3	2025-08-26 19:57:51.117408	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675	\N	2025-08-26 19:57:51.117408
4	2025-08-26 19:59:55.862732	{"1": 4, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 4, "expected": 65, "difference": 61, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675	\N	2025-08-26 19:59:55.862732
5	2025-08-26 20:02:54.425962	{"1": 5, "2": 5, "3": 5, "4": 3, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 3, "expected": 150, "difference": 147, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676	\N	2025-08-26 20:02:54.425962
6	2025-08-26 20:06:28.699571	{"1": 5, "2": 5, "3": 4, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 4, "expected": 97, "difference": 93, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	675	\N	2025-08-26 20:06:28.699571
7	2025-08-26 20:11:54.575036	{"1": 5, "2": 5, "3": 3, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 3, "expected": 97, "difference": 94, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676	\N	2025-08-26 20:11:54.575036
8	2025-08-26 20:17:56.253533	{"1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1}	{"1": {"type": "missing", "actual": 1, "expected": 65, "difference": 64, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 1, "expected": 52, "difference": 51, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 1, "expected": 97, "difference": 96, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 1, "expected": 150, "difference": 149, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 1, "expected": 180, "difference": 179, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 1, "expected": 160, "difference": 159, "productName": "Dry-Shift Hash"}}	698	\N	2025-08-26 20:17:56.253533
9	2025-08-26 20:35:28.138315	{"1": 5, "2": 5, "3": 3, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 3, "expected": 97, "difference": 94, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	676	\N	2025-08-26 20:35:28.138315
10	2025-08-26 20:46:34.720469	{"1": 5, "2": 5, "3": 2, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 2, "expected": 97, "difference": 95, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	677	\N	2025-08-26 20:46:34.720469
11	2025-08-26 21:12:44.116732	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 65, "difference": 60, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 52, "difference": 47, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 97, "difference": 92, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 150, "difference": 145, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 180, "difference": 175, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 160, "difference": 155, "productName": "Dry-Shift Hash"}}	674	\N	2025-08-26 21:12:44.116732
12	2025-08-26 21:26:00.240964	{"1": 5, "2": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 5, "expected": 51, "difference": 46, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 95, "difference": 90, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 149, "difference": 144, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash"}}	665	\N	2025-08-26 21:26:00.240964
13	2025-08-26 21:27:31.037096	{"1": 5, "3": 5, "4": 5, "5": 5, "6": 5}	{"1": {"type": "missing", "actual": 5, "expected": 64, "difference": 59, "productName": "Zkittlez"}, "2": {"type": "missing", "actual": 0, "expected": 51, "difference": 51, "productName": "Blue Dream"}, "3": {"type": "missing", "actual": 5, "expected": 95, "difference": 90, "productName": "Lemon Haze"}, "4": {"type": "missing", "actual": 5, "expected": 149, "difference": 144, "productName": "Wedding Cake"}, "5": {"type": "missing", "actual": 5, "expected": 178, "difference": 173, "productName": "Moroccan Hash"}, "6": {"type": "missing", "actual": 5, "expected": 158, "difference": 153, "productName": "Dry-Shift Hash"}}	670	\N	2025-08-26 21:27:31.037096
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shifts (id, shift_id, worker_name, start_time, end_time, status, shift_date, total_sales, total_expenses, net_amount, stock_discrepancies, reconciliation_id, notes, created_at) FROM stdin;
16	SHIFT 26/08/2025 - 2	hi	2025-08-26 21:27:16.012488	2025-08-26 21:27:31.448	completed	2025-08-26	0.00	0.00	0.00	0	\N	\N	2025-08-26 21:27:16.012488
17	SHIFT 26/08/2025 - 3	again	2025-08-26 21:27:41.416956	\N	active	2025-08-26	0	0	0	0	\N	\N	2025-08-26 21:27:41.416956
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, phone_number, date_of_birth, address, profile_image_url, id_image_url, is_onboarded, onboarding_data, created_at) FROM stdin;
1	demo@member.com	demo123	John	Doe	+44 7700 900123	1990-01-15	123 Demo Street, London, UK	\N	\N	t	\N	2025-08-26 19:23:26.75159
2	admin123@gmail.com	admin123	Admin	User	+44 7700 900456	1985-05-20	456 Admin Road, London, UK	\N	\N	t	\N	2025-08-26 19:23:26.75159
\.


--
-- Name: basket_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.basket_items_id_seq', 13, true);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.donations_id_seq', 6, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expenses_id_seq', 9, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 7, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: shift_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_activities_id_seq', 34, true);


--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_reconciliations_id_seq', 13, true);


--
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shifts_id_seq', 17, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


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
-- Name: expenses expenses_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


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

