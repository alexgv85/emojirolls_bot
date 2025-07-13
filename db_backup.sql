--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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
-- Name: gifts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.gifts (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    value numeric(10,2) NOT NULL,
    icon text NOT NULL,
    type text NOT NULL,
    skin text,
    background text,
    rarity text NOT NULL,
    owner_id integer,
    is_in_game boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.gifts OWNER TO neondb_owner;

--
-- Name: gifts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.gifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gifts_id_seq OWNER TO neondb_owner;

--
-- Name: gifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.gifts_id_seq OWNED BY public.gifts.id;


--
-- Name: pvp_games; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pvp_games (
    id integer NOT NULL,
    status text DEFAULT 'waiting'::text NOT NULL,
    total_value numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    winner_id integer,
    game_hash text NOT NULL,
    countdown_ends timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.pvp_games OWNER TO neondb_owner;

--
-- Name: pvp_games_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pvp_games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pvp_games_id_seq OWNER TO neondb_owner;

--
-- Name: pvp_games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pvp_games_id_seq OWNED BY public.pvp_games.id;


--
-- Name: pvp_participants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pvp_participants (
    id integer NOT NULL,
    game_id integer NOT NULL,
    user_id integer NOT NULL,
    gift_id integer NOT NULL,
    win_chance numeric(5,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pvp_participants OWNER TO neondb_owner;

--
-- Name: pvp_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pvp_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pvp_participants_id_seq OWNER TO neondb_owner;

--
-- Name: pvp_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pvp_participants_id_seq OWNED BY public.pvp_participants.id;


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referred_id integer NOT NULL,
    total_earned numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.referrals OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referrals_id_seq OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: roll_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roll_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    quantity integer NOT NULL,
    cost numeric(10,2) NOT NULL,
    results jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roll_sessions OWNER TO neondb_owner;

--
-- Name: roll_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roll_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roll_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: roll_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roll_sessions_id_seq OWNED BY public.roll_sessions.id;


--
-- Name: shop_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shop_items (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    icon text NOT NULL,
    type text NOT NULL,
    skin text,
    background text,
    rarity text NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.shop_items OWNER TO neondb_owner;

--
-- Name: shop_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shop_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shop_items_id_seq OWNER TO neondb_owner;

--
-- Name: shop_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shop_items_id_seq OWNED BY public.shop_items.id;


--
-- Name: staking; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staking (
    id integer NOT NULL,
    user_id integer NOT NULL,
    gift_id integer NOT NULL,
    staked_at timestamp without time zone DEFAULT now() NOT NULL,
    last_reward_claimed timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staking OWNER TO neondb_owner;

--
-- Name: staking_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.staking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staking_id_seq OWNER TO neondb_owner;

--
-- Name: staking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.staking_id_seq OWNED BY public.staking.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    reward integer NOT NULL,
    type text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_task_completions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_task_completions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    task_id integer NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_task_completions OWNER TO neondb_owner;

--
-- Name: user_task_completions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_task_completions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_task_completions_id_seq OWNER TO neondb_owner;

--
-- Name: user_task_completions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_task_completions_id_seq OWNED BY public.user_task_completions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    telegram_id text NOT NULL,
    balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    wallet_address text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: gifts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.gifts ALTER COLUMN id SET DEFAULT nextval('public.gifts_id_seq'::regclass);


--
-- Name: pvp_games id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_games ALTER COLUMN id SET DEFAULT nextval('public.pvp_games_id_seq'::regclass);


--
-- Name: pvp_participants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_participants ALTER COLUMN id SET DEFAULT nextval('public.pvp_participants_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: roll_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roll_sessions ALTER COLUMN id SET DEFAULT nextval('public.roll_sessions_id_seq'::regclass);


--
-- Name: shop_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shop_items ALTER COLUMN id SET DEFAULT nextval('public.shop_items_id_seq'::regclass);


--
-- Name: staking id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staking ALTER COLUMN id SET DEFAULT nextval('public.staking_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_task_completions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_task_completions ALTER COLUMN id SET DEFAULT nextval('public.user_task_completions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: gifts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.gifts (id, name, description, value, icon, type, skin, background, rarity, owner_id, is_in_game, created_at) FROM stdin;
1	Fire Crystal	A rare prize from rolling	5.20	🔥	prize	default	default	rare	2	f	2025-07-13 12:33:16.717903
2	Mystic Mask	A common prize from rolling	2.20	🎭	prize	default	default	common	2	f	2025-07-13 12:33:32.313822
3	Mystic Mask	A common prize from rolling	2.20	🎭	prize	default	default	common	2	f	2025-07-13 12:33:46.042834
4	Crystal Orb	A epic prize from rolling	50.00	🔮	prize	default	default	epic	2	f	2025-07-13 12:34:25.090976
5	Basic Gift Box	A common prize from rolling	0.80	🎁	prize	default	default	common	2	f	2025-07-13 12:36:18.208207
6	Mystic Mask	A common prize from rolling	2.20	🎭	prize	default	default	common	2	f	2025-07-13 12:36:18.361891
7	Fire Crystal	A rare prize from rolling	5.20	🔥	prize	default	default	rare	2	f	2025-07-13 12:36:18.508263
8	Golden Trophy	A rare prize from rolling	4.50	🏆	prize	default	default	rare	2	f	2025-07-13 12:36:18.652678
9	Circus Tent	A epic prize from rolling	25.00	🎪	prize	default	default	epic	2	f	2025-07-13 12:36:18.797062
10	Fire Crystal	A rare prize from rolling	5.20	🔥	prize	default	default	rare	2	f	2025-07-13 12:36:18.941279
11	Ancient Sword	A rare prize from rolling	8.20	🗡️	prize	default	default	rare	2	f	2025-07-13 12:36:19.094383
12	Crystal Shard	A common prize from rolling	1.80	💎	prize	default	default	common	2	f	2025-07-13 12:36:19.239536
13	Royal Crown	A rare prize from rolling	7.50	👑	prize	default	default	rare	2	f	2025-07-13 12:36:19.383662
14	Bronze Medal	A common prize from rolling	1.00	🏅	prize	default	default	common	2	f	2025-07-13 12:36:19.527918
15	Fire Crystal	A rare prize from rolling	5.20	🔥	prize	default	default	rare	2	f	2025-07-13 12:36:19.672006
16	Golden Trophy	A rare prize from rolling	4.50	🏆	prize	default	default	rare	2	f	2025-07-13 12:36:19.816542
17	Bronze Medal	A common prize from rolling	1.00	🏅	prize	default	default	common	2	f	2025-07-13 12:36:19.961439
18	Bronze Medal	A common prize from rolling	1.00	🏅	prize	default	default	common	2	f	2025-07-13 12:36:20.105964
19	Golden Trophy	A rare prize from rolling	4.50	🏆	prize	default	default	rare	2	f	2025-07-13 12:36:20.25
20	Basic Gift Box	A common prize from rolling	0.80	🎁	prize	default	default	common	2	f	2025-07-13 12:36:20.394819
\.


--
-- Data for Name: pvp_games; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pvp_games (id, status, total_value, winner_id, game_hash, countdown_ends, created_at, completed_at) FROM stdin;
1	waiting	0.00	\N	d89f2d0a1b9db6860a8685763a48bbc0ec03219d6916a3c257b8959a6a561cfc	2025-07-13 12:30:19.876	2025-07-13 12:29:49.949161	\N
\.


--
-- Data for Name: pvp_participants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pvp_participants (id, game_id, user_id, gift_id, win_chance, created_at) FROM stdin;
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.referrals (id, referrer_id, referred_id, total_earned, created_at) FROM stdin;
\.


--
-- Data for Name: roll_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roll_sessions (id, user_id, quantity, cost, results, created_at) FROM stdin;
1	2	1	0.50	[{"icon": "🔥", "name": "Fire Crystal", "value": "5.2", "rarity": "rare"}]	2025-07-13 12:33:17.018612
2	2	1	0.50	[{"icon": "🎭", "name": "Mystic Mask", "value": "2.2", "rarity": "common"}]	2025-07-13 12:33:32.604115
3	2	1	0.50	[{"icon": "🎭", "name": "Mystic Mask", "value": "2.2", "rarity": "common"}]	2025-07-13 12:33:46.332739
4	2	1	0.50	[{"icon": "🔮", "name": "Crystal Orb", "value": "50.0", "rarity": "epic"}]	2025-07-13 12:34:25.390235
5	2	16	8.00	[{"icon": "🎁", "name": "Basic Gift Box", "value": "0.8", "rarity": "common"}, {"icon": "🎭", "name": "Mystic Mask", "value": "2.2", "rarity": "common"}, {"icon": "🔥", "name": "Fire Crystal", "value": "5.2", "rarity": "rare"}, {"icon": "🏆", "name": "Golden Trophy", "value": "4.5", "rarity": "rare"}, {"icon": "🎪", "name": "Circus Tent", "value": "25.0", "rarity": "epic"}, {"icon": "🔥", "name": "Fire Crystal", "value": "5.2", "rarity": "rare"}, {"icon": "🗡️", "name": "Ancient Sword", "value": "8.2", "rarity": "rare"}, {"icon": "💎", "name": "Crystal Shard", "value": "1.8", "rarity": "common"}, {"icon": "👑", "name": "Royal Crown", "value": "7.5", "rarity": "rare"}, {"icon": "🏅", "name": "Bronze Medal", "value": "1.0", "rarity": "common"}, {"icon": "🔥", "name": "Fire Crystal", "value": "5.2", "rarity": "rare"}, {"icon": "🏆", "name": "Golden Trophy", "value": "4.5", "rarity": "rare"}, {"icon": "🏅", "name": "Bronze Medal", "value": "1.0", "rarity": "common"}, {"icon": "🏅", "name": "Bronze Medal", "value": "1.0", "rarity": "common"}, {"icon": "🏆", "name": "Golden Trophy", "value": "4.5", "rarity": "rare"}, {"icon": "🎁", "name": "Basic Gift Box", "value": "0.8", "rarity": "common"}]	2025-07-13 12:36:20.683737
\.


--
-- Data for Name: shop_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shop_items (id, name, description, price, icon, type, skin, background, rarity, is_available, created_at) FROM stdin;
1	Nebula Crystal	A rare cosmic - cosmic	15.00	🌌	cosmic	cosmic	blue	rare	t	2025-07-13 12:29:37.39258
2	Stardust Orb	A common cosmic - cosmic	8.00	✨	cosmic	cosmic	purple	common	t	2025-07-13 12:29:37.541566
3	Galaxy Stone	A epic cosmic - cosmic	25.00	🌠	cosmic	cosmic	gold	epic	t	2025-07-13 12:29:37.686398
4	Meteorite Fragment	A rare cosmic - cosmic	12.00	☄️	cosmic	cosmic	orange	rare	t	2025-07-13 12:29:37.831421
5	Cosmic Gem	A legendary cosmic - cosmic	45.00	💎	cosmic	cosmic	rainbow	legendary	t	2025-07-13 12:29:37.976237
6	Solar Flare	A epic cosmic - cosmic	35.00	🔥	cosmic	cosmic	red	epic	t	2025-07-13 12:29:38.120079
7	Moon Dust	A common cosmic - cosmic	6.00	🌙	cosmic	cosmic	silver	common	t	2025-07-13 12:29:38.266221
8	Pulsar Wave	A legendary cosmic - cosmic	55.00	🌊	cosmic	cosmic	blue	legendary	t	2025-07-13 12:29:38.411777
9	Quasar Light	A legendary cosmic - cosmic	75.00	💫	cosmic	cosmic	gold	legendary	t	2025-07-13 12:29:38.556568
10	Black Hole	A legendary cosmic - cosmic	100.00	⚫	cosmic	cosmic	black	legendary	t	2025-07-13 12:29:38.701253
11	Quantum Processor	A rare tech - tech	22.00	🔬	tech	tech	blue	rare	t	2025-07-13 12:29:38.846515
12	Neural Interface	A rare tech - tech	18.00	🧠	tech	tech	purple	rare	t	2025-07-13 12:29:38.992109
13	Holographic Display	A common tech - tech	14.00	📱	tech	tech	cyan	common	t	2025-07-13 12:29:39.138598
14	Fusion Core	A epic tech - tech	35.00	⚡	tech	tech	yellow	epic	t	2025-07-13 12:29:39.283411
15	Nanobot Swarm	A epic tech - tech	28.00	🤖	tech	tech	green	epic	t	2025-07-13 12:29:39.428206
16	Plasma Cannon	A legendary tech - tech	42.00	🔫	tech	tech	red	legendary	t	2025-07-13 12:29:39.572885
17	Time Machine	A legendary tech - tech	85.00	⏰	tech	tech	gold	legendary	t	2025-07-13 12:29:39.717949
18	AI Core	A legendary tech - tech	65.00	🧮	tech	tech	blue	legendary	t	2025-07-13 12:29:39.862773
19	Teleporter	A legendary tech - tech	70.00	🌀	tech	tech	purple	legendary	t	2025-07-13 12:29:40.008054
20	Energy Shield	A epic tech - tech	32.00	🛡️	tech	tech	cyan	epic	t	2025-07-13 12:29:40.154261
21	Ancient Oak	A rare nature - nature	16.00	🌳	nature	nature	green	rare	t	2025-07-13 12:29:40.298245
22	Mystic Flower	A common nature - nature	9.00	🌸	nature	nature	pink	common	t	2025-07-13 12:29:40.442882
23	Crystal Spring	A rare nature - nature	20.00	💧	nature	nature	blue	rare	t	2025-07-13 12:29:40.587683
24	Golden Leaf	A epic nature - nature	24.00	🍃	nature	nature	gold	epic	t	2025-07-13 12:29:40.732521
25	Thunder Cloud	A epic nature - nature	30.00	⛈️	nature	nature	gray	epic	t	2025-07-13 12:29:40.877392
26	Phoenix Feather	A legendary nature - nature	48.00	🔥	nature	nature	red	legendary	t	2025-07-13 12:29:41.022266
27	Dragon Scale	A legendary nature - nature	55.00	🐉	nature	nature	green	legendary	t	2025-07-13 12:29:41.166139
28	Enchanted Mushroom	A common nature - nature	12.00	🍄	nature	nature	red	common	t	2025-07-13 12:29:41.310969
29	Healing Potion	A rare nature - nature	18.00	🧪	nature	nature	green	rare	t	2025-07-13 12:29:41.456152
30	World Tree Seed	A legendary nature - nature	90.00	🌰	nature	nature	gold	legendary	t	2025-07-13 12:29:41.600132
31	Magic Harp	A epic music - music	26.00	🎵	music	music	gold	epic	t	2025-07-13 12:29:41.744754
32	Crystal Bell	A rare music - music	14.00	🔔	music	music	silver	rare	t	2025-07-13 12:29:41.890266
33	Thunder Drum	A epic music - music	32.00	🥁	music	music	brown	epic	t	2025-07-13 12:29:42.036014
34	Violin of Souls	A legendary music - music	45.00	🎻	music	music	red	legendary	t	2025-07-13 12:29:42.181023
35	Flute of Wind	A rare music - music	22.00	🎶	music	music	blue	rare	t	2025-07-13 12:29:42.326092
36	Piano of Dreams	A legendary music - music	60.00	🎹	music	music	black	legendary	t	2025-07-13 12:29:42.471155
\.


--
-- Data for Name: staking; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staking (id, user_id, gift_id, staked_at, last_reward_claimed) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, title, description, reward, type, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: user_task_completions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_task_completions (id, user_id, task_id, completed_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, telegram_id, balance, wallet_address, created_at) FROM stdin;
1	SampleUser	123456789	100.00	\N	2025-07-13 12:29:37.194454
2	testuser	1	0.00	\N	2025-07-13 12:29:49.393831
\.


--
-- Name: gifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.gifts_id_seq', 20, true);


--
-- Name: pvp_games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pvp_games_id_seq', 1, true);


--
-- Name: pvp_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pvp_participants_id_seq', 1, false);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- Name: roll_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roll_sessions_id_seq', 5, true);


--
-- Name: shop_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shop_items_id_seq', 36, true);


--
-- Name: staking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.staking_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 1, false);


--
-- Name: user_task_completions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_task_completions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: gifts gifts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.gifts
    ADD CONSTRAINT gifts_pkey PRIMARY KEY (id);


--
-- Name: pvp_games pvp_games_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_games
    ADD CONSTRAINT pvp_games_pkey PRIMARY KEY (id);


--
-- Name: pvp_participants pvp_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_participants
    ADD CONSTRAINT pvp_participants_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: roll_sessions roll_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roll_sessions
    ADD CONSTRAINT roll_sessions_pkey PRIMARY KEY (id);


--
-- Name: shop_items shop_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shop_items
    ADD CONSTRAINT shop_items_pkey PRIMARY KEY (id);


--
-- Name: staking staking_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staking
    ADD CONSTRAINT staking_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_task_completions user_task_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_task_completions
    ADD CONSTRAINT user_task_completions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_telegram_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telegram_id_unique UNIQUE (telegram_id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: gifts gifts_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.gifts
    ADD CONSTRAINT gifts_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: pvp_games pvp_games_winner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_games
    ADD CONSTRAINT pvp_games_winner_id_users_id_fk FOREIGN KEY (winner_id) REFERENCES public.users(id);


--
-- Name: pvp_participants pvp_participants_game_id_pvp_games_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_participants
    ADD CONSTRAINT pvp_participants_game_id_pvp_games_id_fk FOREIGN KEY (game_id) REFERENCES public.pvp_games(id);


--
-- Name: pvp_participants pvp_participants_gift_id_gifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_participants
    ADD CONSTRAINT pvp_participants_gift_id_gifts_id_fk FOREIGN KEY (gift_id) REFERENCES public.gifts(id);


--
-- Name: pvp_participants pvp_participants_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pvp_participants
    ADD CONSTRAINT pvp_participants_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referred_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_users_id_fk FOREIGN KEY (referred_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referrer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: roll_sessions roll_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roll_sessions
    ADD CONSTRAINT roll_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: staking staking_gift_id_gifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staking
    ADD CONSTRAINT staking_gift_id_gifts_id_fk FOREIGN KEY (gift_id) REFERENCES public.gifts(id);


--
-- Name: staking staking_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staking
    ADD CONSTRAINT staking_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_task_completions user_task_completions_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_task_completions
    ADD CONSTRAINT user_task_completions_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id);


--
-- Name: user_task_completions user_task_completions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_task_completions
    ADD CONSTRAINT user_task_completions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


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

