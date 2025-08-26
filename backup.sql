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
    created_at timestamp without time zone DEFAULT now()
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
-- Name: shift_reconciliations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_reconciliations ALTER COLUMN id SET DEFAULT nextval('public.shift_reconciliations_id_seq'::regclass);


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
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.expenses (id, description, amount, worker_name, expense_date, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, user_id, pickup_code, items, quantities, total_price, status, archived_from_admin, created_at) FROM stdin;
1	1	4721	[{"name": "Zkittlez", "category": "Indica", "productId": 1, "productCode": "ZK4312"}]	[{"quantity": 2, "productId": 1}]	24	completed	f	2025-08-26 19:23:48.939127
2	1	8935	[{"name": "Blue Dream", "category": "Hybrid", "productId": 2, "productCode": "BD7010"}, {"name": "Lemon Haze", "category": "Sativa", "productId": 3, "productCode": "LH2213"}]	[{"quantity": 1, "productId": 2}, {"quantity": 1, "productId": 3}]	23	completed	f	2025-08-26 19:23:48.939127
3	1	2164	[{"name": "Wedding Cake", "category": "Hybrid", "productId": 4, "productCode": "WC9615"}]	[{"quantity": 3, "productId": 4}]	45	pending	f	2025-08-26 19:23:48.939127
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, image_url, category, product_type, product_code, stock_quantity, admin_price, supplier, on_shelf_grams, internal_grams, external_grams, cost_price, shelf_price, last_updated, is_active, created_at) FROM stdin;
1	Zkittlez	Premium indoor Indica strain with sweet fruity flavors	/api/placeholder/300/200	Indica	Cannabis	ZK4312	200	12	Premium Growers Ltd	65	50	85	8.00	12.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
2	Blue Dream	Popular Sativa-dominant hybrid with blueberry notes	/api/placeholder/300/200	Hybrid	Cannabis	BD7010	180	10	California Seeds Co	52	45	83	7.00	10.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
3	Lemon Haze	Energizing Sativa with citrusy lemon aroma	/api/placeholder/300/200	Sativa	Cannabis	LH2213	220	13	Dutch Masters	97	60	63	9.00	13.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
4	Wedding Cake	Relaxing Indica-dominant hybrid with vanilla undertones	/api/placeholder/300/200	Hybrid	Cannabis	WC9615	160	15	Wedding Growers	150	70	50	11.00	15.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
5	Moroccan Hash	Traditional hash with earthy flavors	/api/placeholder/300/200	Indica	Hash	MH5812	150	12	Moroccan Imports	180	40	70	8.50	12.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
6	Dry-Shift Hash	Premium sativa hash with clean taste	/api/placeholder/300/200	Sativa	Hash	DS1410	140	10	Alpine Hash Co	160	30	50	7.50	10.00	2025-08-26 19:23:40.245968	t	2025-08-26 19:23:40.245968
\.


--
-- Data for Name: shift_reconciliations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_reconciliations (id, shift_date, product_counts, discrepancies, total_discrepancies, admin_notes, created_at) FROM stdin;
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

SELECT pg_catalog.setval('public.basket_items_id_seq', 1, false);


--
-- Name: donations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.donations_id_seq', 2, true);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- Name: shift_reconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_reconciliations_id_seq', 1, false);


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
-- Name: shift_reconciliations shift_reconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_reconciliations
    ADD CONSTRAINT shift_reconciliations_pkey PRIMARY KEY (id);


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
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


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

