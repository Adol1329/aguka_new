--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AccessChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccessChannel" AS ENUM (
    'smartphone',
    'basic_phone',
    'ussd',
    'sms',
    'voice'
);


ALTER TYPE public."AccessChannel" OWNER TO postgres;

--
-- Name: ActivityStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActivityStatus" AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE public."ActivityStatus" OWNER TO postgres;

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActivityType" AS ENUM (
    'meeting',
    'training',
    'harvest',
    'planting',
    'other'
);


ALTER TYPE public."ActivityType" OWNER TO postgres;

--
-- Name: AlertSeverity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AlertSeverity" AS ENUM (
    'info',
    'warning',
    'critical'
);


ALTER TYPE public."AlertSeverity" OWNER TO postgres;

--
-- Name: AlertType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AlertType" AS ENUM (
    'soil',
    'weather',
    'irrigation',
    'pest',
    'disease',
    'market',
    'system',
    'advisory'
);


ALTER TYPE public."AlertType" OWNER TO postgres;

--
-- Name: AnnouncementPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AnnouncementPriority" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE public."AnnouncementPriority" OWNER TO postgres;

--
-- Name: IrrigationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IrrigationType" AS ENUM (
    'drip',
    'sprinkler',
    'manual',
    'flood',
    'none'
);


ALTER TYPE public."IrrigationType" OWNER TO postgres;

--
-- Name: Language; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Language" AS ENUM (
    'kinyarwanda',
    'english',
    'french'
);


ALTER TYPE public."Language" OWNER TO postgres;

--
-- Name: MemberStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MemberStatus" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE public."MemberStatus" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'equipment',
    'inputs',
    'storage',
    'transport'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- Name: SensorType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SensorType" AS ENUM (
    'soil_moisture',
    'soil_temperature',
    'soil_ph',
    'npk',
    'weather',
    'water_level',
    'pump'
);


ALTER TYPE public."SensorType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'farmer',
    'officer',
    'cooperative',
    'admin',
    'super_admin'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: WaterSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WaterSource" AS ENUM (
    'rainwater',
    'well',
    'river',
    'municipal',
    'other'
);


ALTER TYPE public."WaterSource" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Alert; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Alert" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "alertType" public."AlertType" NOT NULL,
    severity public."AlertSeverity" DEFAULT 'info'::public."AlertSeverity" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    recommendation text,
    "isRead" boolean DEFAULT false NOT NULL,
    channel text DEFAULT 'app'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sentViaSms" boolean DEFAULT false NOT NULL,
    "createdById" text
);


ALTER TABLE public."Alert" OWNER TO postgres;

--
-- Name: Announcement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Announcement" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    priority public."AnnouncementPriority" DEFAULT 'normal'::public."AnnouncementPriority" NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Announcement" OWNER TO postgres;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    "resourceType" text,
    "resourceId" text,
    "oldValue" jsonb,
    "newValue" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Backup" (
    id text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'AUTO'::text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "sizeBytes" integer,
    "filePath" text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "restoredAt" timestamp(3) without time zone
);


ALTER TABLE public."Backup" OWNER TO postgres;

--
-- Name: BulkOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BulkOrder" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    "productName" text NOT NULL,
    supplier text,
    quantity numeric(10,2) NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "expectedDelivery" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BulkOrder" OWNER TO postgres;

--
-- Name: Certificate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Certificate" (
    id text NOT NULL,
    "certNumber" text NOT NULL,
    "farmerId" text NOT NULL,
    "officerId" text NOT NULL,
    season text NOT NULL,
    "signatureHash" text NOT NULL,
    status text DEFAULT 'signed'::text NOT NULL,
    "signedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payload jsonb NOT NULL
);


ALTER TABLE public."Certificate" OWNER TO postgres;

--
-- Name: Cooperative; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cooperative" (
    id text NOT NULL,
    name text NOT NULL,
    "registrationNumber" text,
    district text NOT NULL,
    sector text NOT NULL,
    "contactPhone" text,
    "contactEmail" text,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Cooperative" OWNER TO postgres;

--
-- Name: CooperativeActivity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CooperativeActivity" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    title text NOT NULL,
    description text,
    "activityType" public."ActivityType" NOT NULL,
    status public."ActivityStatus" DEFAULT 'scheduled'::public."ActivityStatus" NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    location text,
    "expectedParticipants" integer DEFAULT 0 NOT NULL,
    "actualParticipants" integer,
    "organizerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CooperativeActivity" OWNER TO postgres;

--
-- Name: CooperativeMember; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CooperativeMember" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "cooperativeId" text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    status public."MemberStatus" DEFAULT 'active'::public."MemberStatus" NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastActivityAt" timestamp(3) without time zone
);


ALTER TABLE public."CooperativeMember" OWNER TO postgres;

--
-- Name: CooperativeProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CooperativeProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "cooperativeName" text,
    "registrationNumber" text,
    "cooperativeType" text,
    "memberCount" integer DEFAULT 0,
    "certificateUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."CooperativeProfile" OWNER TO postgres;

--
-- Name: CooperativeReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CooperativeReport" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    title text NOT NULL,
    "reportType" text NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    summary text NOT NULL,
    data jsonb NOT NULL,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedBy" text NOT NULL
);


ALTER TABLE public."CooperativeReport" OWNER TO postgres;

--
-- Name: Crop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Crop" (
    id text NOT NULL,
    "nameEn" text NOT NULL,
    "nameRw" text,
    "nameFr" text,
    category text NOT NULL,
    "growingPeriodDays" integer,
    "waterRequirementMm" numeric(6,2),
    "nitrogenRequirementKgha" numeric(8,2),
    "phosphorusRequirementKgha" numeric(8,2),
    "potassiumRequirementKgha" numeric(8,2),
    "optimalPhMin" numeric(4,2),
    "optimalPhMax" numeric(4,2),
    "optimalTempMinCelsius" numeric(5,2),
    "optimalTempMaxCelsius" numeric(5,2),
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "cropCoefficient" numeric(4,2) DEFAULT 0.8,
    "deletedAt" timestamp(3) without time zone,
    "rootDepthCm" integer DEFAULT 30
);


ALTER TABLE public."Crop" OWNER TO postgres;

--
-- Name: Device; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Device" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fcmToken" text NOT NULL,
    platform text,
    "lastUsedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Device" OWNER TO postgres;

--
-- Name: ExtensionOfficerAssignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExtensionOfficerAssignment" (
    id text NOT NULL,
    "extensionOfficerId" text NOT NULL,
    "farmerId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExtensionOfficerAssignment" OWNER TO postgres;

--
-- Name: ExtensionOfficerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ExtensionOfficerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "employeeId" text,
    organization text,
    "badgePhotoUrl" text,
    specializations text[],
    "coveredSectors" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."ExtensionOfficerProfile" OWNER TO postgres;

--
-- Name: FarmActivity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FarmActivity" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "activityType" text NOT NULL,
    category text,
    "cropId" text,
    quantity numeric(10,2),
    unit text,
    "costRwf" numeric(12,2),
    notes text,
    "activityDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FarmActivity" OWNER TO postgres;

--
-- Name: FarmerCrop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FarmerCrop" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "cropId" text NOT NULL,
    "plantedDate" timestamp(3) without time zone NOT NULL,
    "expectedHarvestDate" timestamp(3) without time zone,
    "actualHarvestDate" timestamp(3) without time zone,
    "plotSizeHectares" numeric(10,2),
    status text DEFAULT 'planted'::text NOT NULL,
    "estimatedYieldKg" numeric(10,2),
    "actualYieldKg" numeric(10,2),
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FarmerCrop" OWNER TO postgres;

--
-- Name: FarmerProfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FarmerProfile" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "cooperativeId" text,
    "fullName" text NOT NULL,
    "farmName" text,
    location text,
    district text NOT NULL,
    sector text NOT NULL,
    cell text,
    village text,
    "farmSizeHectares" numeric(10,2),
    "gpsLatitude" numeric(10,8),
    "gpsLongitude" numeric(10,8),
    "elevationMeters" numeric(10,2),
    "soilType" text,
    "waterSource" public."WaterSource",
    "irrigationType" public."IrrigationType",
    "preferredChannel" public."AccessChannel" DEFAULT 'smartphone'::public."AccessChannel" NOT NULL,
    "literacyLevel" text,
    "profileImageUrl" text,
    "emergencyContact" text,
    "familyMembers" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    cell_code text,
    "deletedAt" timestamp(3) without time zone,
    district_code text,
    province_code text,
    sector_code text,
    village_code text
);


ALTER TABLE public."FarmerProfile" OWNER TO postgres;

--
-- Name: Feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Feedback" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text DEFAULT 'improvement'::text NOT NULL,
    category text DEFAULT 'feature'::text NOT NULL,
    content text NOT NULL,
    rating smallint,
    screenshots text[] DEFAULT ARRAY[]::text[],
    status text DEFAULT 'pending'::text NOT NULL,
    "adminResponse" text,
    "reviewedBy" text,
    "reviewedAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Feedback" OWNER TO postgres;

--
-- Name: ForumComment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ForumComment" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "farmerId" text NOT NULL,
    content text NOT NULL,
    "parentCommentId" text,
    "likesCount" integer DEFAULT 0 NOT NULL,
    "isAcceptedAnswer" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ForumComment" OWNER TO postgres;

--
-- Name: ForumPost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ForumPost" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "cooperativeId" text,
    title text,
    content text NOT NULL,
    category text,
    "imageUrls" text[],
    "likesCount" integer DEFAULT 0 NOT NULL,
    "commentsCount" integer DEFAULT 0 NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isAnswered" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ForumPost" OWNER TO postgres;

--
-- Name: GroupMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GroupMessage" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    "senderId" text NOT NULL,
    "senderName" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."GroupMessage" OWNER TO postgres;

--
-- Name: IrrigationLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IrrigationLog" (
    id text NOT NULL,
    "scheduleId" text,
    "farmerId" text NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "durationMinutes" integer,
    "waterUsedLiters" numeric(10,2),
    "waterSource" public."WaterSource",
    "triggerSource" text,
    status text DEFAULT 'completed'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text,
    "executedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    reason text,
    "triggeredBy" text,
    "zoneId" text
);


ALTER TABLE public."IrrigationLog" OWNER TO postgres;

--
-- Name: IrrigationSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IrrigationSchedule" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "cropId" text,
    "scheduleType" text NOT NULL,
    "startTime" text,
    "durationMinutes" integer,
    frequency text NOT NULL,
    "daysOfWeek" integer[],
    "waterSource" public."WaterSource",
    "waterAmountLiters" numeric(10,2),
    "pumpEnabled" boolean DEFAULT false NOT NULL,
    "valveEnabled" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IrrigationSchedule" OWNER TO postgres;

--
-- Name: IrrigationZone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IrrigationZone" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    name text NOT NULL,
    "sizeHectares" numeric(10,2) NOT NULL,
    "cropType" text,
    "soilType" text,
    "isActive" boolean DEFAULT true NOT NULL,
    status text DEFAULT 'idle'::text NOT NULL,
    "lastIrrigated" timestamp(3) without time zone,
    "nextScheduled" timestamp(3) without time zone,
    "moistureLevel" numeric(5,2),
    temperature numeric(5,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."IrrigationZone" OWNER TO postgres;

--
-- Name: Livestock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Livestock" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "animalType" text NOT NULL,
    breed text,
    "tagNumber" text,
    "birthDate" timestamp(3) without time zone,
    "purchaseDate" timestamp(3) without time zone,
    "weightKg" numeric(6,2),
    "healthStatus" text DEFAULT 'healthy'::text NOT NULL,
    "lastVaccinationDate" timestamp(3) without time zone,
    "nextVaccinationDue" timestamp(3) without time zone,
    "feedingRegime" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Livestock" OWNER TO postgres;

--
-- Name: MarketPrice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MarketPrice" (
    id text NOT NULL,
    "cropId" text NOT NULL,
    "marketName" text NOT NULL,
    district text NOT NULL,
    "priceRwfPerKg" numeric(10,2) NOT NULL,
    currency text DEFAULT 'RWF'::text NOT NULL,
    "recordedAt" timestamp(3) without time zone NOT NULL,
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "marketId" text NOT NULL,
    trend text DEFAULT 'stable'::text NOT NULL,
    "trendPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketPrice" OWNER TO postgres;

--
-- Name: MarketplaceListing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MarketplaceListing" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    "productName" text NOT NULL,
    "cropId" text,
    quantity numeric(10,2) NOT NULL,
    unit text DEFAULT 'kg'::text NOT NULL,
    "pricePerUnit" numeric(10,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "availableQuantity" numeric(10,2) NOT NULL,
    "harvestDate" timestamp(3) without time zone,
    quality text,
    status text DEFAULT 'available'::text NOT NULL,
    "listedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MarketplaceListing" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    channel text DEFAULT 'app'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: NotificationRule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationRule" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    channels text[],
    conditions jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NotificationRule" OWNER TO postgres;

--
-- Name: OTP; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OTP" (
    id text NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OTP" OWNER TO postgres;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    phone text NOT NULL,
    otp text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'RWF'::text NOT NULL,
    provider text NOT NULL,
    "phoneNumber" text NOT NULL,
    "paymentType" text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    reference text NOT NULL,
    "transactionId" text,
    "externalReference" text,
    "completedAt" timestamp(3) without time zone,
    "failureReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: PriceAlert; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PriceAlert" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "cropId" text NOT NULL,
    "marketId" text,
    "targetPrice" numeric(10,2) NOT NULL,
    "currentPrice" numeric(10,2),
    "alertType" text DEFAULT 'price_above'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isTriggered" boolean DEFAULT false NOT NULL,
    "lastTriggered" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PriceAlert" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: Refund; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'processing'::text NOT NULL,
    "refundTransactionId" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Refund" OWNER TO postgres;

--
-- Name: Report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Report" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "cooperativeId" text,
    "reportType" text NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    content jsonb NOT NULL,
    "pdfUrl" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone
);


ALTER TABLE public."Report" OWNER TO postgres;

--
-- Name: Resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Resource" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    name text NOT NULL,
    description text,
    "resourceType" public."ResourceType" NOT NULL,
    quantity integer,
    unit text,
    "availableQuantity" integer,
    condition text,
    location text,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "addedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Resource" OWNER TO postgres;

--
-- Name: ResourceBooking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ResourceBooking" (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "memberId" text NOT NULL,
    quantity integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ResourceBooking" OWNER TO postgres;

--
-- Name: RevokedToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RevokedToken" (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "revokedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RevokedToken" OWNER TO postgres;

--
-- Name: Sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sensor" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "sensorType" public."SensorType" NOT NULL,
    "serialNumber" text NOT NULL,
    "locationOnFarm" text,
    "installationDate" timestamp(3) without time zone,
    "calibrationDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastReadingAt" timestamp(3) without time zone,
    "batteryLevel" numeric(5,2),
    "firmwareVersion" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Sensor" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    device text,
    "ipAddress" text,
    "lastUsedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: SoilReading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SoilReading" (
    id text NOT NULL,
    "sensorId" text,
    "farmerId" text NOT NULL,
    "moisturePercent" numeric(5,2) NOT NULL,
    "temperatureCelsius" numeric(5,2),
    "soilTemperatureCelsius" numeric(5,2),
    "phLevel" numeric(4,2),
    "nitrogenPpm" numeric(8,2),
    "phosphorusPpm" numeric(8,2),
    "potassiumPpm" numeric(8,2),
    "soilHealthScore" integer,
    "readingAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SoilReading" OWNER TO postgres;

--
-- Name: SupportTicket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SupportTicket" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    "adminReply" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedAt" timestamp(3) without time zone
);


ALTER TABLE public."SupportTicket" OWNER TO postgres;

--
-- Name: SystemHealth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemHealth" (
    id text NOT NULL,
    "serviceName" text NOT NULL,
    status text NOT NULL,
    "uptimePercent" numeric(5,2),
    "responseTimeMs" integer,
    "errorCount" integer,
    "lastCheckAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SystemHealth" OWNER TO postgres;

--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemSetting" (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    phone text NOT NULL,
    email text,
    "passwordHash" text,
    role public."UserRole" DEFAULT 'farmer'::public."UserRole" NOT NULL,
    language public."Language" DEFAULT 'kinyarwanda'::public."Language" NOT NULL,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "avatarUrl" text,
    cell text,
    "deletedAt" timestamp(3) without time zone,
    district text,
    "fullName" text,
    "hasMarketAccess" boolean DEFAULT false NOT NULL,
    "hasSensorAccess" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT true NOT NULL,
    "isOnboarded" boolean DEFAULT false NOT NULL,
    province text,
    sector text,
    "serviceAccessExpiresAt" timestamp(3) without time zone,
    "subscriptionExpiresAt" timestamp(3) without time zone,
    "subscriptionType" text DEFAULT 'free'::text,
    village text,
    "requiresPasswordChange" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: WeatherReading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WeatherReading" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "weatherStationId" text,
    "temperatureCelsius" numeric(5,2),
    "humidityPercent" numeric(5,2),
    "rainfallMm" numeric(6,2),
    "windSpeedKmh" numeric(6,2),
    "windDirection" text,
    "pressureHpa" numeric(7,2),
    "uvIndex" numeric(4,2),
    "solarRadiationWm2" numeric(7,2),
    forecast24hr jsonb,
    forecast7day jsonb,
    "readingAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WeatherReading" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: farmer_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farmer_files (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    file_type character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.farmer_files OWNER TO postgres;

--
-- Name: farmer_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.farmer_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.farmer_files_id_seq OWNER TO postgres;

--
-- Name: farmer_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.farmer_files_id_seq OWNED BY public.farmer_files.id;


--
-- Name: farmer_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer_files ALTER COLUMN id SET DEFAULT nextval('public.farmer_files_id_seq'::regclass);


--
-- Data for Name: Alert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Alert" (id, "farmerId", "alertType", severity, title, message, recommendation, "isRead", channel, "createdAt", "sentViaSms", "createdById") FROM stdin;
84ac25bd-7773-4ed2-a3d8-3f2511c70480	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.91	f	\N
bb53384e-4cf1-4fa7-b441-f26aca1b0e4b	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.91	f	\N
7808732f-f236-4663-b2df-ac742ce283b6	d428d51c-0488-453b-8ad0-27d85c9dd1c3	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.941	f	\N
b3376e0f-756d-42fd-af61-2e841b820f38	d428d51c-0488-453b-8ad0-27d85c9dd1c3	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.941	f	\N
9c301232-b6d9-4a32-8f32-e885159eeb91	ddef78d7-c664-4a20-b127-1c960ed27771	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.945	f	\N
8526f1a7-0bfa-4e02-88e2-a00e17b35818	94b406a7-9e49-40df-b43b-a133018ffc5a	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.951	f	\N
71d57163-ebad-4223-a38c-1ace2a5e3bd0	94b406a7-9e49-40df-b43b-a133018ffc5a	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.951	f	\N
0cdb842d-b261-4f96-8bf4-6356e20ac047	94b406a7-9e49-40df-b43b-a133018ffc5a	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:53.951	f	\N
aa7362c5-27e7-4184-ba04-b3a654627ecf	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.957	f	\N
32c08a7d-85df-410b-96ba-08a03693c367	64f73446-869b-454c-9a31-ceae1e1997f3	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.962	f	\N
6dc4bd48-2599-4622-a107-5a5b463bb2ed	64f73446-869b-454c-9a31-ceae1e1997f3	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.962	f	\N
a7ab0561-3e74-443d-b190-5d28fe4bffaf	33825e7e-8324-4d70-9f26-847c8efeb4a0	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.967	f	\N
669caff1-7449-40ab-93f4-3d0acb588da9	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.972	f	\N
920c2dac-ef5a-42ea-b5cd-12d6680554ef	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.972	f	\N
6146568a-d7be-44a5-9fcf-693f933dca58	bec2ea24-6d25-4eac-9438-43e316bbe0a8	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.977	f	\N
1cb42188-edf6-457f-8ac2-2d22c287e757	12e29d36-12f3-441d-a3ea-3217c53cf276	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.981	f	\N
73720045-125f-41f8-b9b4-270030f5db8a	12e29d36-12f3-441d-a3ea-3217c53cf276	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.981	f	\N
ca97130b-8841-415c-b967-f322099baffc	cf6650a4-4871-48f9-8bac-33baf26d0eaf	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.986	f	\N
57b1b057-b865-4ed0-824a-e372d903e34c	d5ad6353-7a3e-4225-8e3b-2329357cbc15	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.991	f	\N
114ecc1c-55a5-4a35-a20d-e4bc89e1ff54	d5ad6353-7a3e-4225-8e3b-2329357cbc15	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:53.991	f	\N
1167daec-f1c1-4065-8b9a-3e8118364b00	d5ad6353-7a3e-4225-8e3b-2329357cbc15	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:53.991	f	\N
128782b2-c146-456a-94d4-0b1e1844c49f	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:53.996	f	\N
5511befe-117c-4b4e-aed8-767075f236da	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.001	f	\N
26c6858c-698d-42dc-b545-4b5829452117	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.001	f	\N
433218e5-7830-4634-a388-fb614da2e14d	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:54.001	f	\N
56cd2c12-7f2b-4c98-bf57-524eba471097	84a8164f-3c51-468d-b547-ec13c0ec9c29	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.006	f	\N
353bc945-a7c1-43b5-af6f-d79ff07f74f3	84a8164f-3c51-468d-b547-ec13c0ec9c29	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.006	f	\N
bad61ccf-e575-448e-bd27-69fd0b583d60	84a8164f-3c51-468d-b547-ec13c0ec9c29	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:54.006	f	\N
783af84f-83d4-4fcc-8dd5-cd57a16ed50f	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.011	f	\N
db29916d-dff9-4605-b1f0-5beef6ddefe4	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.016	f	\N
317b0093-692d-436b-b1fa-960607c13c4b	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.016	f	\N
2dd90cc5-6c7e-451d-83c0-46fccfbf4c6f	05fe63bf-3cd8-4f76-971f-6a58406cef50	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.025	f	\N
7e21e578-8220-4d8d-bcf9-1e11d699b2aa	05fe63bf-3cd8-4f76-971f-6a58406cef50	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.025	f	\N
71873423-0e01-46f6-b51d-43e033a88ba3	05fe63bf-3cd8-4f76-971f-6a58406cef50	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:54.025	f	\N
ab28bb65-c6cb-499c-864c-3655053d9725	4329428a-aed7-41d1-a866-a04f26504f67	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.031	f	\N
262a198f-1936-4bfb-b5b0-3095c6abb4dc	4329428a-aed7-41d1-a866-a04f26504f67	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.031	f	\N
601c05b2-117f-4f9e-97ae-b16fa464197f	4329428a-aed7-41d1-a866-a04f26504f67	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:54.031	f	\N
6cd86a54-7ac8-4ad1-8493-98b0bd81e8de	87880d12-dbc3-4453-bf60-0faced0cbda8	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-05-23 18:19:54.036	f	\N
85955d20-5629-4103-8962-1c37d8ff1175	87880d12-dbc3-4453-bf60-0faced0cbda8	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-05-23 18:19:54.036	f	\N
d64dfd00-072d-4a1e-adc2-c7a7a55e1827	87880d12-dbc3-4453-bf60-0faced0cbda8	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-05-23 18:19:54.036	f	\N
c48ea363-b097-4022-b0cb-5d13e97bb62a	64f73446-869b-454c-9a31-ceae1e1997f3	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	t	app	2026-05-23 18:19:53.962	f	\N
\.


--
-- Data for Name: Announcement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Announcement" (id, "cooperativeId", title, content, priority, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLog" (id, "userId", action, "resourceType", "resourceId", "oldValue", "newValue", "ipAddress", "userAgent", "createdAt") FROM stdin;
3b6f3228-d097-4d99-8691-fb3959901167	7277397f-885a-4623-8dc6-4cdcc676a740	UPDATE_PEST_DISEASE_ALERT	PEST_DISEASE_MANAGEMENT	c48ea363-b097-4022-b0cb-5d13e97bb62a	{"id": "c48ea363-b097-4022-b0cb-5d13e97bb62a", "title": "Pest Risk Elevated", "farmer": {"id": "64f73446-869b-454c-9a31-ceae1e1997f3", "cell": null, "sector": "Ngoma", "userId": "d568b895-a408-4567-b424-5a6977520c7e", "village": null, "cellCode": null, "district": "Huye", "farmName": "Uwera Southern Farm", "fullName": "Immaculée Uwera", "location": null, "soilType": "Clay", "createdAt": "2026-05-23T18:19:52.705Z", "deletedAt": null, "updatedAt": "2026-05-23T18:19:52.705Z", "sectorCode": null, "gpsLatitude": "-2.599", "villageCode": null, "waterSource": "rainwater", "districtCode": null, "gpsLongitude": "29.739", "provinceCode": null, "cooperativeId": "7c0606ca-8263-4b8a-ba5b-ef4a31662d1d", "familyMembers": 0, "literacyLevel": null, "irrigationType": "sprinkler", "elevationMeters": null, "profileImageUrl": null, "emergencyContact": null, "farmSizeHectares": "1.2", "preferredChannel": "smartphone"}, "isRead": false, "channel": "app", "message": "Fall armyworm risk is high this season.", "farmerId": "64f73446-869b-454c-9a31-ceae1e1997f3", "severity": "info", "alertType": "pest", "createdAt": "2026-05-23T18:19:53.962Z", "sentViaSms": false, "createdById": null, "recommendation": "Inspect crops and apply approved pesticide."}	{"id": "c48ea363-b097-4022-b0cb-5d13e97bb62a", "title": "Pest Risk Elevated", "isRead": true, "channel": "app", "message": "Fall armyworm risk is high this season.", "farmerId": "64f73446-869b-454c-9a31-ceae1e1997f3", "severity": "info", "alertType": "pest", "createdAt": "2026-05-23T18:19:53.962Z", "sentViaSms": false, "createdById": null, "recommendation": "Inspect crops and apply approved pesticide."}	\N	\N	2026-05-24 11:10:41.814
78c47176-bd69-419c-9db0-657b032cce6d	7277397f-885a-4623-8dc6-4cdcc676a740	UPDATE_PROFILE	USER_PROFILE	7277397f-885a-4623-8dc6-4cdcc676a740	{"id": "7277397f-885a-4623-8dc6-4cdcc676a740", "cell": null, "role": "officer", "email": "officer1@aguka.rw", "phone": "250780000003", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": "Umujyanama Mukamana", "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:51.675Z", "officerId": "7277397f-885a-4623-8dc6-4cdcc676a740", "updatedAt": "2026-05-23T18:19:51.675Z"}	{"id": "7277397f-885a-4623-8dc6-4cdcc676a740", "cell": "", "role": "officer", "email": "officer1@aguka.rw", "phone": "250780000003", "sector": "", "status": "active", "profile": null, "village": "", "district": "", "fullName": "Umujyanama", "isActive": true, "language": "kinyarwanda", "province": "", "avatarUrl": null, "createdAt": "2026-05-23T18:19:51.675Z", "officerId": "7277397f-885a-4623-8dc6-4cdcc676a740", "updatedAt": "2026-05-24T13:18:30.799Z"}	\N	\N	2026-05-24 13:18:30.826
7c596b38-268d-4896-8d49-21305ce69ba5	66529a0f-42aa-4bb1-899f-a3b947ef77b5	UPDATE_PROFILE	USER_PROFILE	66529a0f-42aa-4bb1-899f-a3b947ef77b5	{"id": "66529a0f-42aa-4bb1-899f-a3b947ef77b5", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": {"id": "87880d12-dbc3-4453-bf60-0faced0cbda8", "cell": null, "sector": "Base", "village": null, "district": "Rulindo", "farmName": "Nyira Mixed Farm", "fullName": "Alice Nyirabashyitsi", "location": null, "gpsLatitude": "-1.74", "waterSource": "rainwater", "gpsLongitude": "29.973", "cooperativeId": "6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8", "familyMembers": 0, "irrigationType": "sprinkler", "emergencyContact": null, "farmSizeHectares": "1.3", "preferredChannel": "smartphone"}, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.936Z", "updatedAt": "2026-05-23T18:19:52.936Z", "cooperativeId": "6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8"}	{"id": "66529a0f-42aa-4bb1-899f-a3b947ef77b5", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": {"id": "87880d12-dbc3-4453-bf60-0faced0cbda8", "cell": null, "sector": "Base", "village": null, "district": "Rulindo", "farmName": "Nyira Mixed Farm", "fullName": "Alice Nyirabashyitsi", "location": null, "gpsLatitude": "-1.74", "waterSource": "rainwater", "gpsLongitude": "29.973", "cooperativeId": "6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8", "familyMembers": 0, "irrigationType": "sprinkler", "emergencyContact": null, "farmSizeHectares": "1.3", "preferredChannel": "smartphone"}, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.936Z", "updatedAt": "2026-05-24T13:21:26.407Z", "cooperativeId": "6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8"}	\N	\N	2026-05-24 13:21:26.424
05497814-eb60-4138-9d84-28f40c9e240c	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	UPDATE_PROFILE	USER_PROFILE	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	{"id": "40c81c96-d342-4946-bfac-0f9c0b9bf3ce", "cell": null, "role": "admin", "email": "admin@aguka.rw", "phone": "250780000002", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:51.548Z", "updatedAt": "2026-05-23T18:19:51.548Z"}	{"id": "40c81c96-d342-4946-bfac-0f9c0b9bf3ce", "cell": "", "role": "admin", "email": "agukaadmin@gmail.com", "phone": "250780000002", "sector": "", "status": "active", "profile": null, "village": "", "district": "", "fullName": "", "isActive": true, "language": "kinyarwanda", "province": "", "avatarUrl": null, "createdAt": "2026-05-23T18:19:51.548Z", "updatedAt": "2026-05-24T13:51:46.544Z"}	\N	\N	2026-05-24 13:51:46.563
8f78af51-f2a8-408c-bd1e-fa46f8e98d62	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	UPDATE_USER_STATUS	USER_MANAGEMENT	12a82e78-e8ef-4197-a39f-055f8ea9f4f9	{"id": "12a82e78-e8ef-4197-a39f-055f8ea9f4f9", "cell": null, "role": "farmer", "email": "theophile.ntu@aguka.rw", "phone": "250788300005", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.690Z", "updatedAt": "2026-05-23T18:19:52.690Z"}	{"id": "12a82e78-e8ef-4197-a39f-055f8ea9f4f9", "cell": null, "role": "farmer", "email": "theophile.ntu@aguka.rw", "phone": "250788300005", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.690Z", "updatedAt": "2026-05-24T13:52:46.452Z"}	\N	\N	2026-05-24 13:52:46.465
028262a2-ac11-4af7-aa7b-1d9759a32d93	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	UPDATE_USER_STATUS	USER_MANAGEMENT	66529a0f-42aa-4bb1-899f-a3b947ef77b5	{"id": "66529a0f-42aa-4bb1-899f-a3b947ef77b5", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.936Z", "updatedAt": "2026-05-24T13:21:26.407Z"}	{"id": "66529a0f-42aa-4bb1-899f-a3b947ef77b5", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": null, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-05-23T18:19:52.936Z", "updatedAt": "2026-05-24T13:53:14.412Z"}	\N	\N	2026-05-24 13:53:14.455
\.


--
-- Data for Name: Backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Backup" (id, name, type, status, "sizeBytes", "filePath", "createdBy", "createdAt", "completedAt", "restoredAt") FROM stdin;
295c1186-38f4-4561-a472-2711ef2649d1	aguka_backup_2026-05-23T19-27-33-288Z.sql	MANUAL	COMPLETED	181872	F:\\Aguka Smart Framing Kit\\aguka-backend\\backups\\aguka_backup_2026-05-23T19-27-33-288Z.sql	5a07c37b-2735-48d8-bcca-46032d90d223	2026-05-23 19:27:33.343	2026-05-23 19:27:35.178	\N
9f374d67-964b-4aed-b998-37284ecedbee	aguka_backup_2026-05-23T19-41-17-309Z.sql	MANUAL	COMPLETED	183021	F:\\Aguka Smart Framing Kit\\aguka-backend\\backups\\aguka_backup_2026-05-23T19-41-17-309Z.sql	5a07c37b-2735-48d8-bcca-46032d90d223	2026-05-23 19:41:17.314	2026-05-23 19:41:18.325	\N
660ec661-8d27-4b80-92ed-b76cb9dbea84	aguka_backup_2026-05-24T14-07-13-402Z.sql	MANUAL	IN_PROGRESS	\N	F:\\Aguka Smart Framing Kit\\aguka-backend\\backups\\aguka_backup_2026-05-24T14-07-13-402Z.sql	5a07c37b-2735-48d8-bcca-46032d90d223	2026-05-24 14:07:13.403	\N	\N
\.


--
-- Data for Name: BulkOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BulkOrder" (id, "cooperativeId", "productName", supplier, quantity, unit, "unitPrice", "totalPrice", status, "expectedDelivery", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Certificate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Certificate" (id, "certNumber", "farmerId", "officerId", season, "signatureHash", status, "signedAt", payload) FROM stdin;
0652520f-993e-4efe-a02c-eb3b18a6c57b	AGK-NYA-5024	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	44028eaf9ba01d03ff4724639608a738f4c3592f39a715a771407d9d676e9004	signed	2026-05-24 11:35:46.573	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 45}, "farmerName": "Théogène Mugwaneza", "cooperative": "Amahoro Coffee Cooperative", "performanceScore": 76}
60797f5b-801c-4a42-920a-452ffef7d312	AGK-NYA-3837	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	92a4ce3ad80c3be7f16acff1ede11f271e45b52c922f6afe6de2ce46e99635fe	signed	2026-05-24 12:00:45.471	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Théogène Mugwaneza", "cooperative": "Amahoro Coffee Cooperative", "performanceScore": 60}
9cc52940-ef33-4ddb-bdbc-8e22bf5d73c2	AGK-NYA-8165	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	a72cbe8ffc27ca6b9d00934b59fc08010051edcc4a316dfc346af45f28f3c26f	signed	2026-05-24 12:08:42.962	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Théogène Mugwaneza", "cooperative": "Amahoro Coffee Cooperative", "performanceScore": 60}
f8754854-24de-43e0-8e4e-9cfedb42ce50	AGK-NYA-8536	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	585e8fefd2194edff07ae4faa0da50e97b352be0aa99a4ff3df0c0dc81ac7e5b	signed	2026-05-24 12:13:19.04	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Théogène Mugwaneza", "cooperative": "Amahoro Coffee Cooperative", "performanceScore": 60}
6512d2ef-e9c7-4c57-99d5-8f72106d0be2	AGK-NYA-3668	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	ba38b34959be4e569dd439c60e08807f1ec9f74488c8d33290e1dc1554a63164	signed	2026-05-24 13:16:42.15	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Théogène Mugwaneza", "cooperative": "Amahoro Coffee Cooperative", "performanceScore": 60}
2fd8254c-cee0-4d51-bb39-286aca1dd3c7	AGK-RUL-4536	87880d12-dbc3-4453-bf60-0faced0cbda8	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	27c341055c419c346a97016aa7037e9e06304c8ff5a6c64b08d00dc6e255e44a	signed	2026-05-24 13:18:01.688	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Alice Nyirabashyitsi", "cooperative": "Agakunze Horticulture Coop", "performanceScore": 60}
c33b5356-2871-4c37-80c6-01ae9e4731c1	AGK-RUL-1297	87880d12-dbc3-4453-bf60-0faced0cbda8	7277397f-885a-4623-8dc6-4cdcc676a740	Season A	8152521bc8ad4197ad9cee353b2590f460e92b58146cea9897926f94c444052f	signed	2026-05-24 13:18:36.643	{"metrics": {"cropProgress": 90, "moistureStability": 100, "irrigationCompliance": 4}, "farmerName": "Alice Nyirabashyitsi", "cooperative": "Agakunze Horticulture Coop", "performanceScore": 60}
\.


--
-- Data for Name: Cooperative; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cooperative" (id, name, "registrationNumber", district, sector, "contactPhone", "contactEmail", description, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
d809879c-757f-49a1-a3bd-e3552ed6a6db	Abunzubumwe Cooperative	COOP/2024/001	Musanze	Kinigi	250788123001	kinigi.coop@gmail.com	Supporting potato and maize farmers in the Kinigi volcanic region.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Agakunze Horticulture Coop	COOP/2024/010	Rulindo	Base	250788123010	agakunze.rulindo@gmail.com	Vegetables, tomatoes and horticulture cooperative for urban markets.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
efaee47c-3083-4116-9967-0f60f6dc33b0	Ubumwe Tea Cooperative	COOP/2024/006	Nyamasheke	Kagano	250788123006	ubumwe.tea@gmail.com	Tea cultivation and processing cooperative near Lake Kivu.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
049bc958-c18a-4bc0-ba57-b35467ad6be9	Amahoro Coffee Cooperative	COOP/2024/008	Nyamagabe	Gasaka	250788123008	amahoro.coffee@gmail.com	Specialty coffee cooperative exporting washed Arabica.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
bea93226-0fbf-4257-861e-a08e5177b3ee	Iterambere Farmers Coop	COOP/2024/002	Rubavu	Gisenyi	250788123002	iterambere.rubavu@gmail.com	Coffee and banana cooperative serving western province farmers.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
93d84783-4aee-4e6b-9e52-457954c0279c	Ejo Heza Wheat Coop	COOP/2024/007	Burera	Rwerere	250788123007	ejoheza.burera@gmail.com	Wheat and Irish potato cooperative operating in highland areas.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
f87121a6-a990-4d15-85d1-e808cdec9465	Intwari Agri Cooperative	COOP/2024/005	Kayonza	Kabarondo	250788123005	intwari.kayonza@gmail.com	Cassava and maize cooperative promoting food security in Eastern province.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
4d2fc665-6bbd-477e-b08a-b573314fb2c8	Twisungane Banana Coop	COOP/2024/009	Ruhango	Kinazi	250788123009	twisungane.ruhango@gmail.com	Banana farming and juice processing cooperative.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
7f61920b-c085-43f4-a0c8-f10d53e4f92b	Tuzamurane Rice Cooperative	COOP/2024/004	Bugesera	Nyamata	250788123004	tuzamurane.bugesera@gmail.com	Specialised in irrigated rice farming in the Nyamata marshlands.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	Duhingane Agricultural Coop	COOP/2024/003	Huye	Ngoma	250788123003	duhingane.huye@gmail.com	Bean and sorghum farming collective in the southern province.	t	2026-05-23 18:19:52.309	2026-05-23 18:19:52.309	\N
\.


--
-- Data for Name: CooperativeActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeActivity" (id, "cooperativeId", title, description, "activityType", status, "scheduledAt", location, "expectedParticipants", "actualParticipants", "organizerId", "createdAt", "updatedAt") FROM stdin;
0d40bafe-3fb6-4fad-84b3-09c3fa67699c	bea93226-0fbf-4257-861e-a08e5177b3ee	Irrigation Best Practices Workshop	\N	training	scheduled	2026-05-25 18:19:52.489	Rubavu - Gisenyi Coop Office	35	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
63c032c9-3462-4979-872b-d0673a96e18d	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	Market Linkage Forum	\N	meeting	scheduled	2026-05-26 18:19:52.489	Huye - Ngoma Coop Office	40	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
84bd3b51-18a9-4287-a826-3ae0076fca0a	d809879c-757f-49a1-a3bd-e3552ed6a6db	Post-harvest Handling Training	\N	training	scheduled	2026-05-24 18:19:52.488	Musanze - Kinigi Coop Office	30	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
f93bb6d2-1acc-4112-80fc-1d3e82eafc97	7f61920b-c085-43f4-a0c8-f10d53e4f92b	Soil Health Seminar	\N	training	scheduled	2026-05-27 18:19:52.489	Bugesera - Nyamata Coop Office	45	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
f6175ab4-3460-4762-9ecd-da61823e8f3f	efaee47c-3083-4116-9967-0f60f6dc33b0	Financial Literacy for Farmers	\N	training	scheduled	2026-05-29 18:19:52.49	Nyamasheke - Kagano Coop Office	55	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
7e4c059c-0bef-423f-9e98-5241afa0f80d	f87121a6-a990-4d15-85d1-e808cdec9465	Pest & Disease Management	\N	training	scheduled	2026-05-28 18:19:52.489	Kayonza - Kabarondo Coop Office	50	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
21d138ea-994c-436a-a59b-da050a9e0450	93d84783-4aee-4e6b-9e52-457954c0279c	Export Standards Training	\N	training	scheduled	2026-05-30 18:19:52.49	Burera - Rwerere Coop Office	60	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
ce0ab632-7cd5-401c-b5ce-fd827eb58cf5	049bc958-c18a-4bc0-ba57-b35467ad6be9	Cooperative Governance Meeting	\N	meeting	scheduled	2026-05-31 18:19:52.49	Nyamagabe - Gasaka Coop Office	65	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
5234fb74-1832-4487-b150-7bb13fcfbdaf	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Climate Smart Agriculture Session	\N	training	scheduled	2026-06-02 18:19:52.491	Rulindo - Base Coop Office	75	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
4af16396-432d-4001-ae20-a063d939d60f	4d2fc665-6bbd-477e-b08a-b573314fb2c8	Agri-Input Subsidy Briefing	\N	meeting	scheduled	2026-06-01 18:19:52.49	Ruhango - Kinazi Coop Office	70	\N	\N	2026-05-23 18:19:52.499	2026-05-23 18:19:52.499
\.


--
-- Data for Name: CooperativeMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeMember" (id, "userId", "cooperativeId", role, status, "joinedAt", "lastActivityAt") FROM stdin;
f13e6c9f-f7e0-4eb8-ad53-cd53dc5a2830	e2023e58-0919-4238-afce-3cd834893c44	f87121a6-a990-4d15-85d1-e808cdec9465	manager	active	2026-05-23 18:19:52.362	\N
6c91b18e-a183-4721-a115-a4ef1d20b234	b72925ef-d55d-453b-b911-4fa911a7e94e	049bc958-c18a-4bc0-ba57-b35467ad6be9	manager	active	2026-05-23 18:19:52.373	\N
1a9ae5ae-d979-4c67-ab61-6e709d36f440	1d597f3b-0606-4cd8-b07f-40ff018edc11	93d84783-4aee-4e6b-9e52-457954c0279c	manager	active	2026-05-23 18:19:52.368	\N
e5ab19ad-b945-46a0-a490-4ea3c1593788	eaab8019-49e2-4e4d-8ee2-9bb06a4697c9	efaee47c-3083-4116-9967-0f60f6dc33b0	manager	active	2026-05-23 18:19:52.365	\N
63bfac53-e707-49d9-8dcd-48113c724808	bab59e71-473c-4c73-a6fb-fe31f9d6f28d	7f61920b-c085-43f4-a0c8-f10d53e4f92b	manager	active	2026-05-23 18:19:52.357	\N
9d1558c7-eac1-4d7b-b8c3-bfe4528762a3	0b2c120c-775a-4154-a7d3-07cff971c58d	d809879c-757f-49a1-a3bd-e3552ed6a6db	member	active	2026-05-23 18:19:52.629	\N
420203e7-213a-47e4-afff-c233390d8cfe	711203c6-c180-4223-879e-9d463585c4c5	d809879c-757f-49a1-a3bd-e3552ed6a6db	member	active	2026-05-23 18:19:52.646	\N
457a544a-144e-4485-97f6-9d751be6d698	e4f54045-383b-42b5-8188-908a3cb1e609	d809879c-757f-49a1-a3bd-e3552ed6a6db	member	active	2026-05-23 18:19:52.663	\N
5b0427bd-71db-47a4-911a-a34891a3ae38	f2ba3f7d-b893-4207-8993-fd515f1317a7	bea93226-0fbf-4257-861e-a08e5177b3ee	member	active	2026-05-23 18:19:52.683	\N
a0703f2b-4ec1-4774-afc3-a3ba84bd34e1	12a82e78-e8ef-4197-a39f-055f8ea9f4f9	bea93226-0fbf-4257-861e-a08e5177b3ee	member	active	2026-05-23 18:19:52.697	\N
9d573d29-c912-401a-b146-53e55a69247c	d568b895-a408-4567-b424-5a6977520c7e	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	member	active	2026-05-23 18:19:52.715	\N
2e4dffc1-913e-4794-b1ec-fbd91976401d	faeadf19-58b0-4789-9fcc-38f11f201db5	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	member	active	2026-05-23 18:19:52.732	\N
c6e24c7e-0964-465d-88d7-08879b9ed1f4	2a3236f2-acb6-4224-a92d-39d1bf22eb29	7f61920b-c085-43f4-a0c8-f10d53e4f92b	member	active	2026-05-23 18:19:52.749	\N
4adca2d3-6570-4052-9084-384dd95ca8ac	0def7d07-b20a-41b0-b5b6-8fd6b9718862	7f61920b-c085-43f4-a0c8-f10d53e4f92b	member	active	2026-05-23 18:19:52.766	\N
bcfb73a7-dd8b-49a1-929a-2474c627cdb0	34e952f9-b2d6-4356-8f4b-d4bd224c104c	f87121a6-a990-4d15-85d1-e808cdec9465	member	active	2026-05-23 18:19:52.784	\N
82ea4248-48ea-43b4-84cf-f9741fa31998	f2fe5e40-4db5-4935-859f-06a5a9ffd411	f87121a6-a990-4d15-85d1-e808cdec9465	member	active	2026-05-23 18:19:52.802	\N
1a49a1f1-eaad-4c0a-8f16-3ad676cd02bc	5546ec0e-8140-4b35-97e2-020cce335b95	efaee47c-3083-4116-9967-0f60f6dc33b0	member	active	2026-05-23 18:19:52.819	\N
b83e258d-7ccf-4038-9f81-f315545c0f9c	75cd296f-fa7e-4860-a2b9-55860b5285e5	efaee47c-3083-4116-9967-0f60f6dc33b0	member	active	2026-05-23 18:19:52.836	\N
73fd3eab-47f3-45c5-bd4b-448d728271d6	eac8772a-d5c1-4e27-820f-a423ce7103d1	93d84783-4aee-4e6b-9e52-457954c0279c	member	active	2026-05-23 18:19:52.854	\N
d123c4b9-b81f-473f-b86d-1306973d5a77	e25de794-13b3-442e-8137-c991484336a7	049bc958-c18a-4bc0-ba57-b35467ad6be9	member	active	2026-05-23 18:19:52.87	\N
466ff78f-ec90-4205-8a03-a6ab97b71b94	e2983090-c933-4e24-816e-8020e21a5ddb	049bc958-c18a-4bc0-ba57-b35467ad6be9	member	active	2026-05-23 18:19:52.884	\N
6c095050-44fa-4cac-93f7-2c38d6c57de9	70bae911-fbbd-422d-9257-18605e8d4b84	4d2fc665-6bbd-477e-b08a-b573314fb2c8	member	active	2026-05-23 18:19:52.9	\N
306109f7-6240-4e86-b79c-2f081de3364e	186fab6d-5d01-46b0-805c-1c1f49dac418	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	member	active	2026-05-23 18:19:52.914	\N
e9c630fb-9820-4bed-b9d9-42a70d31e757	61ae4c39-4af8-4205-9a12-3b5d4d509388	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	member	active	2026-05-23 18:19:52.929	\N
8ce42ac1-08a1-4372-bec5-3ba426471284	66529a0f-42aa-4bb1-899f-a3b947ef77b5	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	member	active	2026-05-23 18:19:52.944	\N
7040b559-9e66-4b2d-98d4-eee43af486c2	94a83477-a836-470f-be6d-8ce19dac39e0	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	manager	active	2026-05-23 18:19:52.377	\N
ae58a963-c366-481d-bfdf-d21969752557	5654c6a6-480b-4a39-ba60-db455ed66d73	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	manager	active	2026-05-23 18:19:52.352	\N
584bd5ea-0437-4cd8-83bb-30e9c5788938	62b31aed-6162-4e5f-94eb-e946f26dd531	d809879c-757f-49a1-a3bd-e3552ed6a6db	manager	active	2026-05-23 18:19:52.347	\N
9fac0a8f-0dc3-43cb-9898-4c96d7f58095	71e4bf77-39be-4ae0-95a5-c126e1722085	bea93226-0fbf-4257-861e-a08e5177b3ee	manager	active	2026-05-23 18:19:52.348	\N
8b780e0b-cffd-4eef-a9a2-ae8e18366e87	04c6ff18-3cf0-4177-80f1-6a6c21e64e0b	4d2fc665-6bbd-477e-b08a-b573314fb2c8	manager	active	2026-05-23 18:19:52.375	\N
\.


--
-- Data for Name: CooperativeProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeProfile" (id, "userId", "cooperativeName", "registrationNumber", "cooperativeType", "memberCount", "certificateUrl", "createdAt", "updatedAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: CooperativeReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeReport" (id, "cooperativeId", title, "reportType", "periodStart", "periodEnd", summary, data, "generatedAt", "generatedBy") FROM stdin;
\.


--
-- Data for Name: Crop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Crop" (id, "nameEn", "nameRw", "nameFr", category, "growingPeriodDays", "waterRequirementMm", "nitrogenRequirementKgha", "phosphorusRequirementKgha", "potassiumRequirementKgha", "optimalPhMin", "optimalPhMax", "optimalTempMinCelsius", "optimalTempMaxCelsius", "imageUrl", "isActive", "cropCoefficient", "deletedAt", "rootDepthCm") FROM stdin;
maize	Maize	Ibigori	\N	Cereal	120	500.00	\N	\N	\N	5.80	7.00	\N	\N	\N	t	0.80	\N	30
cassava	Cassava	Imyumbati	\N	Tuber	360	600.00	\N	\N	\N	4.50	7.00	\N	\N	\N	t	0.80	\N	30
sorghum	Sorghum	Amabigiri	\N	Cereal	130	350.00	\N	\N	\N	5.50	7.50	\N	\N	\N	t	0.80	\N	30
banana	Banana	Igitoki	\N	Fruit	365	1000.00	\N	\N	\N	5.50	6.50	\N	\N	\N	t	0.80	\N	30
beans	Beans	Ibishyimbo	\N	Legume	75	300.00	\N	\N	\N	6.00	7.50	\N	\N	\N	t	0.80	\N	30
coffee	Coffee	Ikawa	\N	Cash Crop	1095	800.00	\N	\N	\N	5.00	6.00	\N	\N	\N	t	0.80	\N	30
tea	Tea	Icyayi	\N	Cash Crop	1460	1200.00	\N	\N	\N	4.50	5.50	\N	\N	\N	t	0.80	\N	30
rice	Rice	Umuceri	\N	Cereal	150	1200.00	\N	\N	\N	5.00	6.50	\N	\N	\N	t	0.80	\N	30
wheat	Wheat	Ingano	\N	Cereal	110	450.00	\N	\N	\N	6.00	7.00	\N	\N	\N	t	0.80	\N	30
potato	Potato	Ibirayi	\N	Tuber	90	400.00	\N	\N	\N	5.00	6.50	\N	\N	\N	t	0.80	\N	30
\.


--
-- Data for Name: Device; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Device" (id, "userId", "fcmToken", platform, "lastUsedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: ExtensionOfficerAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExtensionOfficerAssignment" (id, "extensionOfficerId", "farmerId", "assignedAt") FROM stdin;
7f14eac3-d90d-4ba2-a93c-5990d8da7324	7277397f-885a-4623-8dc6-4cdcc676a740	0b2c120c-775a-4154-a7d3-07cff971c58d	2026-05-23 18:19:52.961
5b8b97dc-ed9c-4ae8-8c7f-89d93964f797	7277397f-885a-4623-8dc6-4cdcc676a740	711203c6-c180-4223-879e-9d463585c4c5	2026-05-23 18:19:52.961
60552ef7-0a03-4bab-8a3b-a8a981658bf7	7277397f-885a-4623-8dc6-4cdcc676a740	e4f54045-383b-42b5-8188-908a3cb1e609	2026-05-23 18:19:52.961
0e7e31a2-df83-49d1-9f4d-9f121ff181d9	7277397f-885a-4623-8dc6-4cdcc676a740	f2ba3f7d-b893-4207-8993-fd515f1317a7	2026-05-23 18:19:52.961
a67cce69-c372-4c99-984a-5f397e040c05	7277397f-885a-4623-8dc6-4cdcc676a740	12a82e78-e8ef-4197-a39f-055f8ea9f4f9	2026-05-23 18:19:52.961
d930e166-3cb4-472a-982b-f134965c88e5	7277397f-885a-4623-8dc6-4cdcc676a740	d568b895-a408-4567-b424-5a6977520c7e	2026-05-23 18:19:52.961
df213618-8018-428f-a7b3-70808cac68c6	7277397f-885a-4623-8dc6-4cdcc676a740	faeadf19-58b0-4789-9fcc-38f11f201db5	2026-05-23 18:19:52.961
d7cede82-e8a9-4b91-8328-7f85fe08a9ca	7277397f-885a-4623-8dc6-4cdcc676a740	2a3236f2-acb6-4224-a92d-39d1bf22eb29	2026-05-23 18:19:52.961
29553722-e6fe-45f8-8bd6-c567c808c552	7277397f-885a-4623-8dc6-4cdcc676a740	0def7d07-b20a-41b0-b5b6-8fd6b9718862	2026-05-23 18:19:52.961
12adea99-65bf-4e95-aed7-a22da519561f	7277397f-885a-4623-8dc6-4cdcc676a740	34e952f9-b2d6-4356-8f4b-d4bd224c104c	2026-05-23 18:19:52.961
5fb8e497-f1f7-46ea-bb5a-9a43bfc4ca8f	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	f2fe5e40-4db5-4935-859f-06a5a9ffd411	2026-05-23 18:19:52.961
d8b66d77-ea00-4eba-a74b-e79b154bd9ab	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	5546ec0e-8140-4b35-97e2-020cce335b95	2026-05-23 18:19:52.961
0faa12d5-bfbb-40dc-b9fd-e0315bd2c540	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	75cd296f-fa7e-4860-a2b9-55860b5285e5	2026-05-23 18:19:52.961
9c01ddac-6f92-47dc-9bd0-bdeed87c3227	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	eac8772a-d5c1-4e27-820f-a423ce7103d1	2026-05-23 18:19:52.961
205e68a0-da30-428c-ad9b-72d1c59306fe	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	e25de794-13b3-442e-8137-c991484336a7	2026-05-23 18:19:52.961
06e5b2bd-2d4b-4720-9a64-c869d4282e49	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	e2983090-c933-4e24-816e-8020e21a5ddb	2026-05-23 18:19:52.961
b4068b45-669f-492e-9cf5-1e6eef9b8fc6	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	70bae911-fbbd-422d-9257-18605e8d4b84	2026-05-23 18:19:52.961
a8745a59-3c46-4050-82ce-189fe47b73ff	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	186fab6d-5d01-46b0-805c-1c1f49dac418	2026-05-23 18:19:52.961
da1c715f-9ded-4afb-8920-07cd5a9822f4	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	61ae4c39-4af8-4205-9a12-3b5d4d509388	2026-05-23 18:19:52.961
7e3335ce-6516-4c89-a4c2-661970cf0e09	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	66529a0f-42aa-4bb1-899f-a3b947ef77b5	2026-05-23 18:19:52.961
\.


--
-- Data for Name: ExtensionOfficerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExtensionOfficerProfile" (id, "userId", "employeeId", organization, "badgePhotoUrl", specializations, "coveredSectors", "createdAt", "updatedAt", "deletedAt") FROM stdin;
3bb1e9c2-530d-4d6c-881d-e1013cf27ece	7277397f-885a-4623-8dc6-4cdcc676a740	OFF-001	Aguka Extension Services	\N	{"Soil health",Irrigation,"Pest management"}	{Kinigi,Gisenyi,Ngoma,Nyamata,Kabarondo}	2026-05-23 18:19:51.675	2026-05-23 18:19:51.675	\N
0c7de23c-b640-4e78-acb3-06f1f06529f3	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	OFF-002	Aguka Extension Services	\N	{Coffee,Tea,"Climate smart agriculture"}	{Kagano,Rwerere,Gasaka,Kinazi,Base}	2026-05-23 18:19:51.697	2026-05-23 18:19:51.697	\N
\.


--
-- Data for Name: FarmActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmActivity" (id, "farmerId", "activityType", category, "cropId", quantity, unit, "costRwf", notes, "activityDate", "createdAt") FROM stdin;
5e5d6641-5b8b-4281-9e82-878cd6ff76d2	33825e7e-8324-4d70-9f26-847c8efeb4a0	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.84	2026-05-23 18:19:53.842
0e623718-ebf4-40a3-a000-e4c178c3cb59	33825e7e-8324-4d70-9f26-847c8efeb4a0	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.84	2026-05-23 18:19:53.842
4101c5c3-12a1-484b-8e99-69ce801f4dfe	33825e7e-8324-4d70-9f26-847c8efeb4a0	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.84	2026-05-23 18:19:53.842
1574f575-9c73-4d0b-ace7-1dba0b1eeb48	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.844	2026-05-23 18:19:53.846
21afd41d-ac3e-4e42-8a52-ed862171fa73	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.844	2026-05-23 18:19:53.846
edd3d0f1-8853-4da0-9680-979eef8d4781	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.844	2026-05-23 18:19:53.846
436196d9-7b1c-4cba-92de-16dd9b8936c8	bec2ea24-6d25-4eac-9438-43e316bbe0a8	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.849	2026-05-23 18:19:53.85
e72817f4-426f-4d9d-8e4a-24dad05980c8	bec2ea24-6d25-4eac-9438-43e316bbe0a8	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.849	2026-05-23 18:19:53.85
9e6abba9-291e-4553-9f59-d7da6345dc66	bec2ea24-6d25-4eac-9438-43e316bbe0a8	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.849	2026-05-23 18:19:53.85
40a08a06-62fb-488a-98cb-5338a3d0919e	12e29d36-12f3-441d-a3ea-3217c53cf276	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.852	2026-05-23 18:19:53.854
97206217-7f50-4cdc-95ef-08f5197d38e7	12e29d36-12f3-441d-a3ea-3217c53cf276	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.852	2026-05-23 18:19:53.854
54c5e70e-b720-4a91-a402-54cc3c2ea5f2	12e29d36-12f3-441d-a3ea-3217c53cf276	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.852	2026-05-23 18:19:53.854
97c81c4a-9923-43fb-b32d-456fa10fee42	cf6650a4-4871-48f9-8bac-33baf26d0eaf	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.856	2026-05-23 18:19:53.858
037dfc9c-4dc9-4351-b7c4-d55f28dc51f0	cf6650a4-4871-48f9-8bac-33baf26d0eaf	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.856	2026-05-23 18:19:53.858
e19ac411-bd9c-4a36-a45a-6de237a522df	cf6650a4-4871-48f9-8bac-33baf26d0eaf	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.856	2026-05-23 18:19:53.858
1bcad6af-2180-4953-accc-c2010040c4c4	d5ad6353-7a3e-4225-8e3b-2329357cbc15	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.861	2026-05-23 18:19:53.863
9f42d8ac-0214-42bf-8fa3-255d8268a2fb	d5ad6353-7a3e-4225-8e3b-2329357cbc15	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.861	2026-05-23 18:19:53.863
e5bfa303-6418-4678-9943-87bb2fb9ada0	d5ad6353-7a3e-4225-8e3b-2329357cbc15	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.861	2026-05-23 18:19:53.863
17017a6a-152e-4529-ac2b-2ed963520ca5	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.865	2026-05-23 18:19:53.867
63a767ed-da20-41ad-a209-f3a10d01e222	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.865	2026-05-23 18:19:53.867
a720db22-a85d-46d8-97f8-1074afaa5695	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.865	2026-05-23 18:19:53.867
cff6a263-0ec2-43f7-8cd4-42fc8ac648dd	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.869	2026-05-23 18:19:53.872
923aa4dc-e51d-45f0-b1ec-860c2d2a22d6	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.869	2026-05-23 18:19:53.872
7356cebb-0aa9-4a52-a216-345f2d8ce742	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.869	2026-05-23 18:19:53.872
09fdbf11-bc95-472b-bb6f-f2d2946b9f09	84a8164f-3c51-468d-b547-ec13c0ec9c29	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.877	2026-05-23 18:19:53.879
7642e499-70c4-42b8-b391-3cd9b39c8b33	84a8164f-3c51-468d-b547-ec13c0ec9c29	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.877	2026-05-23 18:19:53.879
7da89299-dd2c-4a91-87b8-11ae0f83a051	84a8164f-3c51-468d-b547-ec13c0ec9c29	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.877	2026-05-23 18:19:53.879
e51b6d2f-806b-42c5-929a-cc907fbc40c8	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.882	2026-05-23 18:19:53.884
b05bc136-337c-491f-8027-3f5f11d2aa4f	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.882	2026-05-23 18:19:53.884
4e93d7cd-4caf-4376-ba1b-d9736909f335	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.882	2026-05-23 18:19:53.884
616e58a8-9d51-468a-8c19-127dea225e32	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.886	2026-05-23 18:19:53.889
0f17d2eb-e20e-47f9-b0b0-cc2f26b873a3	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.766	2026-05-23 18:19:53.772
cb87a49b-3a69-46a7-b56d-4575a3329157	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.766	2026-05-23 18:19:53.772
2264f481-f951-4997-8072-fda112d308bb	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.766	2026-05-23 18:19:53.772
ece57714-644b-47c2-b804-8c191efe1513	d428d51c-0488-453b-8ad0-27d85c9dd1c3	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.811	2026-05-23 18:19:53.815
bfbe69bd-2293-4358-9def-31abaa9d72ce	d428d51c-0488-453b-8ad0-27d85c9dd1c3	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.811	2026-05-23 18:19:53.815
b3b8d5b1-5f71-44d7-90fa-828a4286d446	d428d51c-0488-453b-8ad0-27d85c9dd1c3	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.811	2026-05-23 18:19:53.815
dd3b008a-5b42-4cfa-aefa-d49522a5487e	ddef78d7-c664-4a20-b127-1c960ed27771	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.819	2026-05-23 18:19:53.822
454c4197-7905-4dc8-b9e7-f8457b97ae9e	ddef78d7-c664-4a20-b127-1c960ed27771	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.819	2026-05-23 18:19:53.822
fe3ff857-ed00-48da-bb55-00e84713e582	ddef78d7-c664-4a20-b127-1c960ed27771	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.819	2026-05-23 18:19:53.822
320bfd05-8626-4fcc-9298-bb264adddcc5	94b406a7-9e49-40df-b43b-a133018ffc5a	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.825	2026-05-23 18:19:53.828
0ff5c3ed-cb81-405e-a2d7-c3c7189de586	94b406a7-9e49-40df-b43b-a133018ffc5a	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.825	2026-05-23 18:19:53.828
8b426471-5c3d-4c57-8ea1-6e25d52fde54	94b406a7-9e49-40df-b43b-a133018ffc5a	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.825	2026-05-23 18:19:53.828
f15b1f89-417e-430e-aaf0-0bb2eb17f26f	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.831	2026-05-23 18:19:53.833
85eb2ee5-9446-4289-baff-3eeacd1f484f	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.831	2026-05-23 18:19:53.833
f1dabc49-0e69-41b4-9ad7-8291c81ea328	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.831	2026-05-23 18:19:53.833
7ddb9671-717a-4feb-8620-9008ed3f41c3	64f73446-869b-454c-9a31-ceae1e1997f3	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.836	2026-05-23 18:19:53.838
03d3296c-303d-49ce-b58d-84f1aa11ad53	64f73446-869b-454c-9a31-ceae1e1997f3	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.836	2026-05-23 18:19:53.838
982700a5-17a4-4629-8ce6-dd1cc48223d3	64f73446-869b-454c-9a31-ceae1e1997f3	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.836	2026-05-23 18:19:53.838
1586cbc6-b4d1-4257-ba53-9fca85467238	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.886	2026-05-23 18:19:53.889
09d1612a-d250-4cf4-ade0-08a25b1962f5	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.886	2026-05-23 18:19:53.889
17ccf73a-496e-45af-971b-ca1e178954d2	05fe63bf-3cd8-4f76-971f-6a58406cef50	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.892	2026-05-23 18:19:53.894
3e73c9d8-5cb3-4ec0-9a1a-af525bcce61c	05fe63bf-3cd8-4f76-971f-6a58406cef50	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.892	2026-05-23 18:19:53.894
d2ccaea2-5549-48f6-81af-a6f4b4557286	05fe63bf-3cd8-4f76-971f-6a58406cef50	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.892	2026-05-23 18:19:53.894
156474e2-4d2d-4788-ad01-68b20b435711	4329428a-aed7-41d1-a866-a04f26504f67	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.898	2026-05-23 18:19:53.9
8ff3b801-95ad-49f9-817e-84fdf88ec07c	4329428a-aed7-41d1-a866-a04f26504f67	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.898	2026-05-23 18:19:53.9
f4b89641-d137-4e51-af3f-00cae852dfb5	4329428a-aed7-41d1-a866-a04f26504f67	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.898	2026-05-23 18:19:53.9
c000517e-c577-41b2-bec7-f8aff6f8643e	87880d12-dbc3-4453-bf60-0faced0cbda8	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-03-24 18:19:53.902	2026-05-23 18:19:53.905
f3033e06-f4d5-4a74-a94d-57703453b01a	87880d12-dbc3-4453-bf60-0faced0cbda8	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-04-08 18:19:53.902	2026-05-23 18:19:53.905
b488731e-714a-43ab-b6b4-8618754d698a	87880d12-dbc3-4453-bf60-0faced0cbda8	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-04-23 18:19:53.902	2026-05-23 18:19:53.905
\.


--
-- Data for Name: FarmerCrop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerCrop" (id, "farmerId", "cropId", "plantedDate", "expectedHarvestDate", "actualHarvestDate", "plotSizeHectares", status, "estimatedYieldKg", "actualYieldKg", notes, "createdAt", "updatedAt") FROM stdin;
958294c9-b950-4dd9-b322-f669cfc9d57e	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	maize	2026-03-24 10:16:29.062	\N	\N	1.30	growing	\N	\N	\N	2026-05-23 18:19:52.978	2026-05-23 18:19:52.978
5bdd2010-38cc-4cac-8268-5bbe13ac7f29	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	potato	2026-04-02 03:08:27.415	\N	\N	1.30	growing	\N	\N	\N	2026-05-23 18:19:53.008	2026-05-23 18:19:53.008
1dd04d88-c233-46e2-b752-b66db25fdedb	d428d51c-0488-453b-8ad0-27d85c9dd1c3	potato	2026-04-27 22:35:53.118	\N	\N	0.90	growing	\N	\N	\N	2026-05-23 18:19:53.013	2026-05-23 18:19:53.013
d59bc49d-b038-4564-bbe9-e73387ec7f3c	d428d51c-0488-453b-8ad0-27d85c9dd1c3	beans	2026-05-22 02:39:27.23	\N	\N	0.90	growing	\N	\N	\N	2026-05-23 18:19:53.016	2026-05-23 18:19:53.016
93c38e80-d637-453e-8987-238a881e338d	ddef78d7-c664-4a20-b127-1c960ed27771	maize	2026-04-05 06:14:14.561	\N	\N	1.50	growing	\N	\N	\N	2026-05-23 18:19:53.021	2026-05-23 18:19:53.021
2e602024-6b04-4ecc-8b15-3fe7d3c4b8da	ddef78d7-c664-4a20-b127-1c960ed27771	wheat	2026-04-05 09:23:32.514	\N	\N	1.50	growing	\N	\N	\N	2026-05-23 18:19:53.025	2026-05-23 18:19:53.025
89763957-975c-449c-9050-08816e3a6766	94b406a7-9e49-40df-b43b-a133018ffc5a	coffee	2026-02-27 05:51:14.098	\N	\N	0.80	growing	\N	\N	\N	2026-05-23 18:19:53.029	2026-05-23 18:19:53.029
aa09af55-c4d2-4a4b-93ee-2c8ed2b6e60f	94b406a7-9e49-40df-b43b-a133018ffc5a	banana	2026-03-17 21:34:16.976	\N	\N	0.80	growing	\N	\N	\N	2026-05-23 18:19:53.031	2026-05-23 18:19:53.031
a3277681-4fbb-4692-b16e-4d34de17ec2b	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	coffee	2026-05-08 17:13:57.579	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.035	2026-05-23 18:19:53.035
625222ee-84d4-400d-9b69-1f1177de3457	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	beans	2026-03-06 03:12:22.401	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.038	2026-05-23 18:19:53.038
1a51b1fe-9ef7-4b4d-b21b-fa0c97ea7d2c	64f73446-869b-454c-9a31-ceae1e1997f3	beans	2026-03-20 06:40:54.162	\N	\N	0.60	growing	\N	\N	\N	2026-05-23 18:19:53.042	2026-05-23 18:19:53.042
c1e3fe3a-13dc-465d-999b-964c61334704	64f73446-869b-454c-9a31-ceae1e1997f3	sorghum	2026-04-09 08:17:12.959	\N	\N	0.60	growing	\N	\N	\N	2026-05-23 18:19:53.045	2026-05-23 18:19:53.045
4ed34705-37ed-4df0-98a9-09e84967131c	33825e7e-8324-4d70-9f26-847c8efeb4a0	beans	2026-05-13 20:00:00.492	\N	\N	1.00	growing	\N	\N	\N	2026-05-23 18:19:53.048	2026-05-23 18:19:53.048
b8c064ed-68b4-4d59-99ac-ea182de87dcb	33825e7e-8324-4d70-9f26-847c8efeb4a0	maize	2026-03-03 19:03:13.838	\N	\N	1.00	growing	\N	\N	\N	2026-05-23 18:19:53.05	2026-05-23 18:19:53.05
9bb85074-ad4a-4c6f-8855-ee6090dedc74	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	rice	2026-05-18 21:58:40.646	\N	\N	1.80	growing	\N	\N	\N	2026-05-23 18:19:53.055	2026-05-23 18:19:53.055
2d6655c8-d8ef-47e4-89ba-274c4e7219bc	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	beans	2026-04-24 01:54:40.242	\N	\N	1.80	growing	\N	\N	\N	2026-05-23 18:19:53.062	2026-05-23 18:19:53.062
47163803-646f-4872-aff6-bd0c334c574c	bec2ea24-6d25-4eac-9438-43e316bbe0a8	rice	2026-05-07 22:39:07.302	\N	\N	4.00	growing	\N	\N	\N	2026-05-23 18:19:53.066	2026-05-23 18:19:53.066
4c614733-ee0e-4723-902c-e26f73341a02	12e29d36-12f3-441d-a3ea-3217c53cf276	cassava	2026-05-07 06:52:48.564	\N	\N	1.40	growing	\N	\N	\N	2026-05-23 18:19:53.07	2026-05-23 18:19:53.07
ce11b799-d765-465f-8cdb-da9b276e0c66	12e29d36-12f3-441d-a3ea-3217c53cf276	maize	2026-04-14 20:04:40.758	\N	\N	1.40	growing	\N	\N	\N	2026-05-23 18:19:53.072	2026-05-23 18:19:53.072
96e602a2-a073-43ac-ad32-4c6a0fd559be	cf6650a4-4871-48f9-8bac-33baf26d0eaf	cassava	2026-03-26 12:55:22.895	\N	\N	0.80	growing	\N	\N	\N	2026-05-23 18:19:53.075	2026-05-23 18:19:53.075
030b430e-d227-4eb5-be96-97387fe54ee6	cf6650a4-4871-48f9-8bac-33baf26d0eaf	beans	2026-03-05 14:38:50.456	\N	\N	0.80	growing	\N	\N	\N	2026-05-23 18:19:53.077	2026-05-23 18:19:53.077
7172dbcd-1511-41b6-b02b-a9529ba4491d	d5ad6353-7a3e-4225-8e3b-2329357cbc15	tea	2026-04-17 10:27:56.937	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.079	2026-05-23 18:19:53.079
2b481eed-6df7-4798-83bd-3e64fb415346	d5ad6353-7a3e-4225-8e3b-2329357cbc15	coffee	2026-05-05 15:45:26.972	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.082	2026-05-23 18:19:53.082
a7051901-9085-4dc3-bca5-503d08eefcb5	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	tea	2026-03-03 04:03:41.682	\N	\N	0.90	growing	\N	\N	\N	2026-05-23 18:19:53.084	2026-05-23 18:19:53.084
9a699327-a09f-49f8-9f0e-0a86dfeb71b8	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	banana	2026-03-16 04:09:36.547	\N	\N	0.90	growing	\N	\N	\N	2026-05-23 18:19:53.086	2026-05-23 18:19:53.086
d8e06b21-1873-4503-9f33-a331abd6d392	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	wheat	2026-03-30 23:35:02.468	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.088	2026-05-23 18:19:53.088
9a5b34b5-f897-4f58-8436-ec57de6b175e	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	potato	2026-04-02 20:30:06.29	\N	\N	1.10	growing	\N	\N	\N	2026-05-23 18:19:53.091	2026-05-23 18:19:53.091
2e25ecbc-56aa-459f-8925-37a5b6db71db	84a8164f-3c51-468d-b547-ec13c0ec9c29	coffee	2026-03-22 04:49:03.887	\N	\N	3.20	growing	\N	\N	\N	2026-05-23 18:19:53.094	2026-05-23 18:19:53.094
f14b96cb-4a3f-4b2a-bbfa-44439ad8e716	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	coffee	2026-04-20 01:53:54.184	\N	\N	1.40	growing	\N	\N	\N	2026-05-23 18:19:53.097	2026-05-23 18:19:53.097
dea7dc07-20bd-458a-bdcb-fe6edd8d2093	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	beans	2026-05-20 04:44:43.653	\N	\N	1.40	growing	\N	\N	\N	2026-05-23 18:19:53.1	2026-05-23 18:19:53.1
f8f4a039-4875-47ba-9628-4b4b53fd747c	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	banana	2026-05-01 13:38:34.069	\N	\N	0.70	growing	\N	\N	\N	2026-05-23 18:19:53.103	2026-05-23 18:19:53.103
21e4e00f-94dd-4ee8-a647-74899e90314a	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	maize	2026-02-28 02:41:50.896	\N	\N	0.70	growing	\N	\N	\N	2026-05-23 18:19:53.106	2026-05-23 18:19:53.106
71395434-25f3-4487-b87b-cf262295d1d4	05fe63bf-3cd8-4f76-971f-6a58406cef50	beans	2026-03-26 17:04:12.26	\N	\N	0.60	growing	\N	\N	\N	2026-05-23 18:19:53.109	2026-05-23 18:19:53.109
f42dc86c-d559-453f-8532-1e3b362df115	05fe63bf-3cd8-4f76-971f-6a58406cef50	wheat	2026-05-15 04:28:01.021	\N	\N	0.60	growing	\N	\N	\N	2026-05-23 18:19:53.111	2026-05-23 18:19:53.111
2c327ac1-e243-4a4f-8db9-5cb59523d63a	4329428a-aed7-41d1-a866-a04f26504f67	maize	2026-04-15 10:42:35.585	\N	\N	0.50	growing	\N	\N	\N	2026-05-23 18:19:53.115	2026-05-23 18:19:53.115
d484a15b-3309-4afa-8832-eedbb3a58510	4329428a-aed7-41d1-a866-a04f26504f67	cassava	2026-03-22 02:25:48.986	\N	\N	0.50	growing	\N	\N	\N	2026-05-23 18:19:53.117	2026-05-23 18:19:53.117
0b109c18-ccbe-4520-8d9e-c56773c84ecd	87880d12-dbc3-4453-bf60-0faced0cbda8	beans	2026-04-11 13:21:01.859	\N	\N	0.70	growing	\N	\N	\N	2026-05-23 18:19:53.12	2026-05-23 18:19:53.12
048c69bb-45ee-40e7-bf99-c2fcc7dd0032	87880d12-dbc3-4453-bf60-0faced0cbda8	banana	2026-03-08 04:41:13.224	\N	\N	0.70	growing	\N	\N	\N	2026-05-23 18:19:53.122	2026-05-23 18:19:53.122
3b0d8f3a-d78f-4b1d-bb51-8fa06e76c526	87880d12-dbc3-4453-bf60-0faced0cbda8	cassava	2026-05-24 13:21:26.219	\N	\N	\N	growing	\N	\N	\N	2026-05-24 13:21:26.237	2026-05-24 13:21:26.237
\.


--
-- Data for Name: FarmerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerProfile" (id, "userId", "cooperativeId", "fullName", "farmName", location, district, sector, cell, village, "farmSizeHectares", "gpsLatitude", "gpsLongitude", "elevationMeters", "soilType", "waterSource", "irrigationType", "preferredChannel", "literacyLevel", "profileImageUrl", "emergencyContact", "familyMembers", "createdAt", "updatedAt", cell_code, "deletedAt", district_code, province_code, sector_code, village_code) FROM stdin;
84a8164f-3c51-468d-b547-ec13c0ec9c29	e25de794-13b3-442e-8137-c991484336a7	049bc958-c18a-4bc0-ba57-b35467ad6be9	Odette Ingabire	Ingabire Coffee Estate	\N	Nyamagabe	Gasaka	\N	\N	3.20	-2.45200000	29.52000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.862	2026-05-23 18:19:52.862	\N	\N	\N	\N	\N	\N
896aea8f-c4b3-4aec-9e79-dbc2d337ead5	e2983090-c933-4e24-816e-8020e21a5ddb	049bc958-c18a-4bc0-ba57-b35467ad6be9	Théogène Mugwaneza	Mugwaneza Arabica Farm	\N	Nyamagabe	Gasaka	\N	\N	2.70	-2.46000000	29.52800000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.876	2026-05-23 18:19:52.876	\N	\N	\N	\N	\N	\N
4b98763f-7f2c-44d1-b1c7-2214bd9672b7	70bae911-fbbd-422d-9257-18605e8d4b84	4d2fc665-6bbd-477e-b08a-b573314fb2c8	Jean-Paul Habimana	Habimana Banana Grove	\N	Ruhango	Kinazi	\N	\N	1.40	-2.22400000	29.78000000	\N	Loamy	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.891	2026-05-23 18:19:52.891	\N	\N	\N	\N	\N	\N
f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	0b2c120c-775a-4154-a7d3-07cff971c58d	d809879c-757f-49a1-a3bd-e3552ed6a6db	Jean Damascene Habimana	Habimana Family Farm	\N	Musanze	Kinigi	\N	\N	2.50	-1.43330000	29.63330000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.574	2026-05-23 18:19:52.574	\N	\N	\N	\N	\N	\N
d428d51c-0488-453b-8ad0-27d85c9dd1c3	711203c6-c180-4223-879e-9d463585c4c5	d809879c-757f-49a1-a3bd-e3552ed6a6db	Solange Uwimana	Uwimana Green Farm	\N	Musanze	Kinigi	\N	\N	1.80	-1.44100000	29.62000000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.637	2026-05-23 18:19:52.637	\N	\N	\N	\N	\N	\N
ddef78d7-c664-4a20-b127-1c960ed27771	e4f54045-383b-42b5-8188-908a3cb1e609	d809879c-757f-49a1-a3bd-e3552ed6a6db	Célestin Bizimana	Bizimana Hillside Farm	\N	Musanze	Kinigi	\N	\N	3.00	-1.42900000	29.64000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.654	2026-05-23 18:19:52.654	\N	\N	\N	\N	\N	\N
94b406a7-9e49-40df-b43b-a133018ffc5a	f2ba3f7d-b893-4207-8993-fd515f1317a7	bea93226-0fbf-4257-861e-a08e5177b3ee	Claudine Mukandayisenga	Mukand Riverside Farm	\N	Rubavu	Gisenyi	\N	\N	1.50	-1.68330000	29.26670000	\N	Sandy Loam	river	flood	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.672	2026-05-23 18:19:52.672	\N	\N	\N	\N	\N	\N
abfbf812-0dc4-4584-aa4c-cca80d04fb6b	12a82e78-e8ef-4197-a39f-055f8ea9f4f9	bea93226-0fbf-4257-861e-a08e5177b3ee	Théophile Ntungwanayo	Ntu Lake Farm	\N	Rubavu	Gisenyi	\N	\N	2.20	-1.67500000	29.28000000	\N	Loamy	well	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.69	2026-05-23 18:19:52.69	\N	\N	\N	\N	\N	\N
64f73446-869b-454c-9a31-ceae1e1997f3	d568b895-a408-4567-b424-5a6977520c7e	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	Immaculée Uwera	Uwera Southern Farm	\N	Huye	Ngoma	\N	\N	1.20	-2.59900000	29.73900000	\N	Clay	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.705	2026-05-23 18:19:52.705	\N	\N	\N	\N	\N	\N
33825e7e-8324-4d70-9f26-847c8efeb4a0	faeadf19-58b0-4789-9fcc-38f11f201db5	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	Évariste Nzigiyimana	Nzigi Valley Farm	\N	Huye	Ngoma	\N	\N	2.00	-2.60500000	29.74500000	\N	Sandy	well	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.723	2026-05-23 18:19:52.723	\N	\N	\N	\N	\N	\N
0fb2e1a6-105f-4a37-9e6a-230bb744fd87	2a3236f2-acb6-4224-a92d-39d1bf22eb29	7f61920b-c085-43f4-a0c8-f10d53e4f92b	Vestine Nkusi	Nkusi Marshland Farm	\N	Bugesera	Nyamata	\N	\N	3.50	-2.15300000	30.05200000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.741	2026-05-23 18:19:52.741	\N	\N	\N	\N	\N	\N
bec2ea24-6d25-4eac-9438-43e316bbe0a8	0def7d07-b20a-41b0-b5b6-8fd6b9718862	7f61920b-c085-43f4-a0c8-f10d53e4f92b	Patrice Mugabo	Mugabo Rice Fields	\N	Bugesera	Nyamata	\N	\N	4.00	-2.16100000	30.06000000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.758	2026-05-23 18:19:52.758	\N	\N	\N	\N	\N	\N
12e29d36-12f3-441d-a3ea-3217c53cf276	34e952f9-b2d6-4356-8f4b-d4bd224c104c	f87121a6-a990-4d15-85d1-e808cdec9465	Domitille Uwimana	Uwimana Eastern Farm	\N	Kayonza	Kabarondo	\N	\N	2.80	-1.59700000	30.62800000	\N	Sandy Loam	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.774	2026-05-23 18:19:52.774	\N	\N	\N	\N	\N	\N
cf6650a4-4871-48f9-8bac-33baf26d0eaf	f2fe5e40-4db5-4935-859f-06a5a9ffd411	f87121a6-a990-4d15-85d1-e808cdec9465	Alexis Mugenzi	Mugenzi Savanna Farm	\N	Kayonza	Kabarondo	\N	\N	1.60	-1.60200000	30.63500000	\N	Sandy	well	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.794	2026-05-23 18:19:52.794	\N	\N	\N	\N	\N	\N
d5ad6353-7a3e-4225-8e3b-2329357cbc15	5546ec0e-8140-4b35-97e2-020cce335b95	efaee47c-3083-4116-9967-0f60f6dc33b0	Chantal Nkurukiyinka	Nkuru Tea Gardens	\N	Nyamasheke	Kagano	\N	\N	2.10	-2.33500000	29.17800000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.81	2026-05-23 18:19:52.81	\N	\N	\N	\N	\N	\N
ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	75cd296f-fa7e-4860-a2b9-55860b5285e5	efaee47c-3083-4116-9967-0f60f6dc33b0	Félix Rutagengwa	Rutagengwa Lake Farm	\N	Nyamasheke	Kagano	\N	\N	1.90	-2.34100000	29.18300000	\N	Loamy	river	flood	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.828	2026-05-23 18:19:52.828	\N	\N	\N	\N	\N	\N
9a7ae355-2606-4ad7-bbc5-260c76e5c78e	eac8772a-d5c1-4e27-820f-a423ce7103d1	93d84783-4aee-4e6b-9e52-457954c0279c	Fidèle Nshimiyimana	Nshimi Highland Farm	\N	Burera	Rwerere	\N	\N	2.30	-1.47000000	29.85000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.845	2026-05-23 18:19:52.845	\N	\N	\N	\N	\N	\N
05fe63bf-3cd8-4f76-971f-6a58406cef50	186fab6d-5d01-46b0-805c-1c1f49dac418	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Yvonne Mutuyimana	Mutuy Green Acres	\N	Rulindo	Base	\N	\N	1.10	-1.72900000	29.96000000	\N	Clay Loam	well	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.908	2026-05-23 18:19:52.908	\N	\N	\N	\N	\N	\N
4329428a-aed7-41d1-a866-a04f26504f67	61ae4c39-4af8-4205-9a12-3b5d4d509388	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Gabriel Niyonzima	Niyonzima Horticulture	\N	Rulindo	Base	\N	\N	0.90	-1.73500000	29.96700000	\N	Sandy Loam	river	drip	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.921	2026-05-23 18:19:52.921	\N	\N	\N	\N	\N	\N
87880d12-dbc3-4453-bf60-0faced0cbda8	66529a0f-42aa-4bb1-899f-a3b947ef77b5	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Alice Nyirabashyitsi	Nyira Mixed Farm	\N	Rulindo	Base	\N	\N	1.30	-1.74000000	29.97300000	\N	Loamy	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-05-23 18:19:52.936	2026-05-23 18:19:52.936	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Feedback" (id, "userId", type, category, content, rating, screenshots, status, "adminResponse", "reviewedBy", "reviewedAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ForumComment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ForumComment" (id, "postId", "farmerId", content, "parentCommentId", "likesCount", "isAcceptedAnswer", "createdAt") FROM stdin;
\.


--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ForumPost" (id, "farmerId", "cooperativeId", title, content, category, "imageUrls", "likesCount", "commentsCount", "isPinned", "isAnswered", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: GroupMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GroupMessage" (id, "cooperativeId", "senderId", "senderName", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: IrrigationLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationLog" (id, "scheduleId", "farmerId", "startTime", "endTime", "durationMinutes", "waterUsedLiters", "waterSource", "triggerSource", status, "createdAt", action, "executedAt", reason, "triggeredBy", "zoneId") FROM stdin;
e7f21542-5ef7-40a5-b58f-cdccdd9ec934	10fc1bc5-6ff5-4127-b9b1-86495a0e1ccc	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	\N	\N	25	486.00	\N	\N	completed	2026-05-23 18:19:53.483	START	2026-05-22 18:19:53.481	Scheduled irrigation	schedule	eac11e54-a477-4578-97c3-e4cce1c6f4d0
5b0d0a90-2e11-4a64-b83b-3cf02d141939	572b4ce7-a94c-4d5d-ab1a-335316ded580	d428d51c-0488-453b-8ad0-27d85c9dd1c3	\N	\N	25	578.00	\N	\N	completed	2026-05-23 18:19:53.529	START	2026-05-22 18:19:53.527	Scheduled irrigation	schedule	b120b43c-eca0-4d12-88c7-1e9d3d59fd8a
9c4abbb3-1f1b-4526-95a9-2ce19d91bde4	a4b8ccfd-26f6-457f-99da-f897ec8f4b63	ddef78d7-c664-4a20-b127-1c960ed27771	\N	\N	25	541.00	\N	\N	completed	2026-05-23 18:19:53.542	START	2026-05-22 18:19:53.54	Scheduled irrigation	schedule	04ba13f6-c186-4ac9-9faf-9a47e6401bc6
eef9f345-5a8c-4aa7-9aa0-2ba1fccec258	f8946f0e-bdeb-4ed2-aa0a-e981dc630f1a	94b406a7-9e49-40df-b43b-a133018ffc5a	\N	\N	25	380.00	\N	\N	completed	2026-05-23 18:19:53.554	START	2026-05-22 18:19:53.552	Scheduled irrigation	schedule	ea04b97a-b903-43bf-bfce-6daaca5256f8
dd370370-f062-4f9d-a4e4-d0dea6561bfd	942146e0-e853-4763-b41a-830fb172bca6	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	\N	\N	25	436.00	\N	\N	completed	2026-05-23 18:19:53.566	START	2026-05-22 18:19:53.564	Scheduled irrigation	schedule	5ea06ce5-748f-40f4-b401-ee463af8c37e
e74a9c35-d18c-4510-aaba-2a66dab1ebda	2f6e4695-ecc6-4518-bdff-a5aac2ace3cb	64f73446-869b-454c-9a31-ceae1e1997f3	\N	\N	25	556.00	\N	\N	completed	2026-05-23 18:19:53.577	START	2026-05-22 18:19:53.575	Scheduled irrigation	schedule	812f499f-632d-4914-b75f-0c3406cf1e17
a5fc2cde-968c-44ee-8c2b-299eb42ab9b5	31eec50c-a415-4813-b7a7-57529b687f29	33825e7e-8324-4d70-9f26-847c8efeb4a0	\N	\N	25	345.00	\N	\N	completed	2026-05-23 18:19:53.595	START	2026-05-22 18:19:53.593	Scheduled irrigation	schedule	d87eec09-a2bc-49b0-931c-56ecc2c4602b
3f912ce0-dc2a-475d-9311-8075f851f431	f5b01eed-4ec4-487d-9f81-005e7941702a	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	\N	\N	25	377.00	\N	\N	completed	2026-05-23 18:19:53.606	START	2026-05-22 18:19:53.604	Scheduled irrigation	schedule	f966aa0c-8b32-46bc-9b26-46d4c66a3929
ef457325-926a-446e-b4d9-49b780f9b314	7e0bd638-6e44-4b7d-b964-3af15728db90	bec2ea24-6d25-4eac-9438-43e316bbe0a8	\N	\N	25	567.00	\N	\N	completed	2026-05-23 18:19:53.622	START	2026-05-22 18:19:53.62	Scheduled irrigation	schedule	79b9635c-4b91-4e43-a966-8daeb87c94ad
233aaca7-653e-4cec-aa83-6872591cb43d	33a7cb1c-da93-418c-a06b-269cdd767c5b	12e29d36-12f3-441d-a3ea-3217c53cf276	\N	\N	25	352.00	\N	\N	completed	2026-05-23 18:19:53.633	START	2026-05-22 18:19:53.631	Scheduled irrigation	schedule	c89b076e-1c73-4e52-89f7-0772da9e8ce1
cd2e9381-f776-417a-b407-1cb80af3615d	e1f6fc94-f1d5-4840-b701-5a1cf90806c0	cf6650a4-4871-48f9-8bac-33baf26d0eaf	\N	\N	25	416.00	\N	\N	completed	2026-05-23 18:19:53.644	START	2026-05-22 18:19:53.642	Scheduled irrigation	schedule	c4655e52-71e8-4f95-9d30-48a759431286
162b35ae-eb9c-4fd7-8813-54ac82029a85	4827427a-9812-47fb-97e6-b4c66437ac16	d5ad6353-7a3e-4225-8e3b-2329357cbc15	\N	\N	25	457.00	\N	\N	completed	2026-05-23 18:19:53.667	START	2026-05-22 18:19:53.665	Scheduled irrigation	schedule	84fba5a8-32a5-4aee-93a0-0e494b9945f7
1c954cf4-4ee3-4138-8fcc-533305a23b6b	eaf64c10-e053-4ef6-8029-1677f9afefe1	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	\N	\N	25	571.00	\N	\N	completed	2026-05-23 18:19:53.678	START	2026-05-22 18:19:53.676	Scheduled irrigation	schedule	0e50ddb8-e405-449e-80eb-81f2a7287194
83bf1108-7b53-42af-92c9-a1be77e6d43e	8c58f0b5-916f-4c1d-9e3f-a6de4cd50320	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	\N	\N	25	316.00	\N	\N	completed	2026-05-23 18:19:53.691	START	2026-05-22 18:19:53.689	Scheduled irrigation	schedule	eee71487-94e1-412a-89d5-58a742a37bcf
18e11535-a74e-4855-98ec-bddace8e1b5d	f278305c-325b-4899-9e87-a89ab0ec9ec9	84a8164f-3c51-468d-b547-ec13c0ec9c29	\N	\N	25	362.00	\N	\N	completed	2026-05-23 18:19:53.704	START	2026-05-22 18:19:53.701	Scheduled irrigation	schedule	149891a8-3a09-46cc-a18f-38130df35a61
808b0010-1da8-4788-8a3e-eac00e51a6ad	b142a888-85fd-4c53-9987-0addd47cd85f	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	\N	\N	25	511.00	\N	\N	completed	2026-05-23 18:19:53.716	START	2026-05-22 18:19:53.714	Scheduled irrigation	schedule	0de2bc89-0f54-4529-a63a-22ea8e2e853d
72a61d5e-ebdc-4324-bd04-06d109f07cc4	4642aa14-4766-4d93-a0a0-7e95a169d25d	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	\N	\N	25	559.00	\N	\N	completed	2026-05-23 18:19:53.726	START	2026-05-22 18:19:53.724	Scheduled irrigation	schedule	c0cb441a-abf7-4187-a910-b63c8b37ce45
27c80d6b-883e-41de-8368-d6342891a52b	bf6751c3-647d-4b8f-8796-202fd026c3ff	05fe63bf-3cd8-4f76-971f-6a58406cef50	\N	\N	25	372.00	\N	\N	completed	2026-05-23 18:19:53.738	START	2026-05-22 18:19:53.736	Scheduled irrigation	schedule	6e6bb93f-df1d-442b-b530-460da1909567
b45de56b-6ded-42a5-a90e-65eb34c1c205	e036a749-d665-4596-81d8-b651d0d9456b	4329428a-aed7-41d1-a866-a04f26504f67	\N	\N	25	345.00	\N	\N	completed	2026-05-23 18:19:53.748	START	2026-05-22 18:19:53.748	Scheduled irrigation	schedule	03aa783b-7152-4461-b474-da5960838431
b35a6b2b-f11e-41aa-accd-fda5e69e9517	95c6cb9e-9a27-4a3d-95b8-6a58ef921239	87880d12-dbc3-4453-bf60-0faced0cbda8	\N	\N	25	505.00	\N	\N	completed	2026-05-23 18:19:53.762	START	2026-05-22 18:19:53.76	Scheduled irrigation	schedule	3ad2a2c2-384c-48dd-86ea-d299edec9780
\.


--
-- Data for Name: IrrigationSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationSchedule" (id, "farmerId", "cropId", "scheduleType", "startTime", "durationMinutes", frequency, "daysOfWeek", "waterSource", "waterAmountLiters", "pumpEnabled", "valveEnabled", "isActive", "createdAt", "updatedAt") FROM stdin;
10fc1bc5-6ff5-4127-b9b1-86495a0e1ccc	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	\N	daily	06:00	23	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.47	2026-05-23 18:19:53.47
572b4ce7-a94c-4d5d-ab1a-335316ded580	d428d51c-0488-453b-8ad0-27d85c9dd1c3	\N	daily	06:00	39	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.524	2026-05-23 18:19:53.524
a4b8ccfd-26f6-457f-99da-f897ec8f4b63	ddef78d7-c664-4a20-b127-1c960ed27771	\N	daily	05:00	21	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.537	2026-05-23 18:19:53.537
f8946f0e-bdeb-4ed2-aa0a-e981dc630f1a	94b406a7-9e49-40df-b43b-a133018ffc5a	\N	daily	05:00	24	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.55	2026-05-23 18:19:53.55
942146e0-e853-4763-b41a-830fb172bca6	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	\N	daily	07:00	39	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.562	2026-05-23 18:19:53.562
2f6e4695-ecc6-4518-bdff-a5aac2ace3cb	64f73446-869b-454c-9a31-ceae1e1997f3	\N	daily	07:00	38	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.573	2026-05-23 18:19:53.573
31eec50c-a415-4813-b7a7-57529b687f29	33825e7e-8324-4d70-9f26-847c8efeb4a0	\N	daily	06:00	27	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.591	2026-05-23 18:19:53.591
f5b01eed-4ec4-487d-9f81-005e7941702a	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	\N	daily	07:00	28	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.602	2026-05-23 18:19:53.602
7e0bd638-6e44-4b7d-b964-3af15728db90	bec2ea24-6d25-4eac-9438-43e316bbe0a8	\N	daily	06:00	24	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.614	2026-05-23 18:19:53.614
33a7cb1c-da93-418c-a06b-269cdd767c5b	12e29d36-12f3-441d-a3ea-3217c53cf276	\N	daily	06:00	36	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.629	2026-05-23 18:19:53.629
e1f6fc94-f1d5-4840-b701-5a1cf90806c0	cf6650a4-4871-48f9-8bac-33baf26d0eaf	\N	daily	05:00	25	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.64	2026-05-23 18:19:53.64
4827427a-9812-47fb-97e6-b4c66437ac16	d5ad6353-7a3e-4225-8e3b-2329357cbc15	\N	daily	05:00	33	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.663	2026-05-23 18:19:53.663
eaf64c10-e053-4ef6-8029-1677f9afefe1	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	\N	daily	06:00	31	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.673	2026-05-23 18:19:53.673
8c58f0b5-916f-4c1d-9e3f-a6de4cd50320	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	\N	daily	07:00	23	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.687	2026-05-23 18:19:53.687
f278305c-325b-4899-9e87-a89ab0ec9ec9	84a8164f-3c51-468d-b547-ec13c0ec9c29	\N	daily	05:00	21	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.698	2026-05-23 18:19:53.698
b142a888-85fd-4c53-9987-0addd47cd85f	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	\N	daily	07:00	24	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.712	2026-05-23 18:19:53.712
4642aa14-4766-4d93-a0a0-7e95a169d25d	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	\N	daily	06:00	25	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.722	2026-05-23 18:19:53.722
bf6751c3-647d-4b8f-8796-202fd026c3ff	05fe63bf-3cd8-4f76-971f-6a58406cef50	\N	daily	06:00	38	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.734	2026-05-23 18:19:53.734
e036a749-d665-4596-81d8-b651d0d9456b	4329428a-aed7-41d1-a866-a04f26504f67	\N	daily	06:00	27	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.745	2026-05-23 18:19:53.745
95c6cb9e-9a27-4a3d-95b8-6a58ef921239	87880d12-dbc3-4453-bf60-0faced0cbda8	\N	daily	06:00	38	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-05-23 18:19:53.758	2026-05-23 18:19:53.758
\.


--
-- Data for Name: IrrigationZone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationZone" (id, "farmerId", name, "sizeHectares", "cropType", "soilType", "isActive", status, "lastIrrigated", "nextScheduled", "moistureLevel", temperature, "createdAt", "updatedAt") FROM stdin;
eac11e54-a477-4578-97c3-e4cce1c6f4d0	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	Main Plot	1.80	maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.46	2026-05-23 18:19:53.46
b120b43c-eca0-4d12-88c7-1e9d3d59fd8a	d428d51c-0488-453b-8ad0-27d85c9dd1c3	Main Plot	1.30	potato	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.521	2026-05-23 18:19:53.521
04ba13f6-c186-4ac9-9faf-9a47e6401bc6	ddef78d7-c664-4a20-b127-1c960ed27771	Main Plot	2.10	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.534	2026-05-23 18:19:53.534
ea04b97a-b903-43bf-bfce-6daaca5256f8	94b406a7-9e49-40df-b43b-a133018ffc5a	Main Plot	1.00	coffee	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.547	2026-05-23 18:19:53.547
5ea06ce5-748f-40f4-b401-ee463af8c37e	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	Main Plot	1.50	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.559	2026-05-23 18:19:53.559
812f499f-632d-4914-b75f-0c3406cf1e17	64f73446-869b-454c-9a31-ceae1e1997f3	Main Plot	0.80	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.57	2026-05-23 18:19:53.57
d87eec09-a2bc-49b0-931c-56ecc2c4602b	33825e7e-8324-4d70-9f26-847c8efeb4a0	Main Plot	1.40	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.582	2026-05-23 18:19:53.582
f966aa0c-8b32-46bc-9b26-46d4c66a3929	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	Main Plot	2.40	rice	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.6	2026-05-23 18:19:53.6
79b9635c-4b91-4e43-a966-8daeb87c94ad	bec2ea24-6d25-4eac-9438-43e316bbe0a8	Main Plot	2.80	rice	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.612	2026-05-23 18:19:53.612
c89b076e-1c73-4e52-89f7-0772da9e8ce1	12e29d36-12f3-441d-a3ea-3217c53cf276	Main Plot	2.00	cassava	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.627	2026-05-23 18:19:53.627
c4655e52-71e8-4f95-9d30-48a759431286	cf6650a4-4871-48f9-8bac-33baf26d0eaf	Main Plot	1.10	cassava	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.637	2026-05-23 18:19:53.637
84fba5a8-32a5-4aee-93a0-0e494b9945f7	d5ad6353-7a3e-4225-8e3b-2329357cbc15	Main Plot	1.50	tea	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.66	2026-05-23 18:19:53.66
0e50ddb8-e405-449e-80eb-81f2a7287194	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	Main Plot	1.30	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.67	2026-05-23 18:19:53.67
eee71487-94e1-412a-89d5-58a742a37bcf	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	Main Plot	1.60	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.684	2026-05-23 18:19:53.684
149891a8-3a09-46cc-a18f-38130df35a61	84a8164f-3c51-468d-b547-ec13c0ec9c29	Main Plot	2.20	coffee	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.696	2026-05-23 18:19:53.696
0de2bc89-0f54-4529-a63a-22ea8e2e853d	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	Main Plot	1.90	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.709	2026-05-23 18:19:53.709
c0cb441a-abf7-4187-a910-b63c8b37ce45	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	Main Plot	1.00	Maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.719	2026-05-23 18:19:53.719
6e6bb93f-df1d-442b-b530-460da1909567	05fe63bf-3cd8-4f76-971f-6a58406cef50	Main Plot	0.80	beans	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.731	2026-05-23 18:19:53.731
03aa783b-7152-4461-b474-da5960838431	4329428a-aed7-41d1-a866-a04f26504f67	Main Plot	0.60	maize	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.742	2026-05-23 18:19:53.742
3ad2a2c2-384c-48dd-86ea-d299edec9780	87880d12-dbc3-4453-bf60-0faced0cbda8	Main Plot	0.90	beans	\N	t	idle	\N	\N	\N	\N	2026-05-23 18:19:53.755	2026-05-23 18:19:53.755
\.


--
-- Data for Name: Livestock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Livestock" (id, "farmerId", "animalType", breed, "tagNumber", "birthDate", "purchaseDate", "weightKg", "healthStatus", "lastVaccinationDate", "nextVaccinationDue", "feedingRegime", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: MarketPrice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MarketPrice" (id, "cropId", "marketName", district, "priceRwfPerKg", currency, "recordedAt", source, "createdAt", "marketId", trend, "trendPercentage", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketplaceListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MarketplaceListing" (id, "cooperativeId", "productName", "cropId", quantity, unit, "pricePerUnit", "totalPrice", "availableQuantity", "harvestDate", quality, status, "listedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, message, channel, "sentAt", status, "createdAt") FROM stdin;
\.


--
-- Data for Name: NotificationRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationRule" (id, "userId", name, description, type, enabled, channels, conditions, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OTP; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OTP" (id, phone, code, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, phone, otp, attempts, "expiresAt", "createdAt") FROM stdin;
f833e494-7c61-4e33-ac9e-2eba992a1cf1	250788100027	105123	0	2026-05-22 08:29:12.098	2026-05-22 08:19:12.1
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "userId", amount, currency, provider, "phoneNumber", "paymentType", description, status, reference, "transactionId", "externalReference", "completedAt", "failureReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PriceAlert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PriceAlert" (id, "userId", "cropId", "marketId", "targetPrice", "currentPrice", "alertType", "isActive", "isTriggered", "lastTriggered", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
2b3c64c0-b39c-4511-84a9-d86ab7db22c1	66529a0f-42aa-4bb1-899f-a3b947ef77b5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjUyOWEwZi00MmFhLTRiYjEtODk5Zi1hM2I5NDdlZjc3YjUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3OTYyOTc3NywiZXhwIjoxNzgwMjM0NTc3fQ.koauEELoPxyTOPRw2RLyVbsb9430gBPwQprgB6c5ZSg	2026-05-31 13:36:17.015	2026-05-24 13:20:51.053
6e122003-e1f9-4d67-8136-2710af1ba0fa	7277397f-885a-4623-8dc6-4cdcc676a740	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3Mjc3Mzk3Zi04ODVhLTQ2MjMtOGRjNi00Y2RjYzY3NmE3NDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3OTYzMTAyMSwiZXhwIjoxNzgwMjM1ODIxfQ._DJRWV4DscURyYpxDfqPcN--Jmhv1pbriTbBYUeG2vg	2026-05-31 13:57:01.251	2026-05-24 13:36:27.766
6e6ba1e9-be33-42ed-aca5-3bbce0961f4e	b43dbcf0-3e13-4555-845a-9f2f9f86aac9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNDNkYmNmMC0zZTEzLTQ1NTUtODQ1YS05ZjJmOWY4NmFhYzkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3OTYzMTA2MSwiZXhwIjoxNzgwMjM1ODYxfQ.9-lUMl-5M5MYtTHTqmMVA1BVKE46g-MjgD_1WEVfI_4	2026-05-31 13:57:41.594	2026-05-24 13:57:41.594
308f327d-be25-48f2-a9c6-7350d4fbdaab	5a07c37b-2735-48d8-bcca-46032d90d223	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YTA3YzM3Yi0yNzM1LTQ4ZDgtYmNjYS00NjAzMmQ5MGQyMjMiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3OTYzMTQ2MiwiZXhwIjoxNzgwMjM2MjYyfQ.P_czCIZQJcXp6CtAZgvDt1TgqMmU5DkCNVTpliMd1Ms	2026-05-31 14:04:22.051	2026-05-24 14:04:22.052
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Refund" (id, "paymentId", amount, reason, status, "refundTransactionId", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Report" (id, "farmerId", "cooperativeId", "reportType", "periodStart", "periodEnd", content, "pdfUrl", status, "createdAt", "approvedBy", "approvedAt") FROM stdin;
436dcacf-3477-4cca-ad82-745076c2066f	84a8164f-3c51-468d-b547-ec13c0ec9c29	049bc958-c18a-4bc0-ba57-b35467ad6be9	financial	2026-01-01 00:00:00	2026-12-31 00:00:00	{"refunds": [], "summary": {"netRevenue": 0, "totalRefunds": 0, "totalRevenue": 0, "transactionCount": 0}, "payments": []}	\N	completed	2026-05-23 19:28:57.307	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	2026-05-23 19:28:57.305
01890531-e61d-455d-b5c6-f9849a63cc4f	84a8164f-3c51-468d-b547-ec13c0ec9c29	049bc958-c18a-4bc0-ba57-b35467ad6be9	financial	2026-01-01 00:00:00	2026-12-31 00:00:00	{"refunds": [], "summary": {"netRevenue": 0, "totalRefunds": 0, "totalRevenue": 0, "transactionCount": 0}, "payments": []}	\N	completed	2026-05-23 19:41:16.96	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	2026-05-23 19:41:16.957
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Resource" (id, "cooperativeId", name, description, "resourceType", quantity, unit, "availableQuantity", condition, location, "isAvailable", "addedBy", "createdAt", "updatedAt") FROM stdin;
29cabf55-08b1-4225-8848-7baa7df17307	049bc958-c18a-4bc0-ba57-b35467ad6be9	Truck T1	Transport truck 3-tonne capacity	equipment	\N	\N	\N	\N	\N	t	b72925ef-d55d-453b-b911-4fa911a7e94e	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
3b3f28ce-b107-4365-81c9-17ef07e99b9b	bea93226-0fbf-4257-861e-a08e5177b3ee	Sprayer Unit B2	Motorised crop sprayer	equipment	\N	\N	\N	\N	\N	t	71e4bf77-39be-4ae0-95a5-c126e1722085	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
bb13f70a-e301-4c2e-875c-3e4ae1c5f540	93d84783-4aee-4e6b-9e52-457954c0279c	Greenhouse G1	Seedling greenhouse 200m²	storage	\N	\N	\N	\N	\N	t	1d597f3b-0606-4cd8-b07f-40ff018edc11	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
99e36d03-b829-4972-937c-e365fe67c3c6	6f527b5d-ccb1-4af6-8b2f-58b50dbed1a8	Processing Unit P2	Coffee wet processing station	equipment	\N	\N	\N	\N	\N	t	94a83477-a836-470f-be6d-8ce19dac39e0	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
da9cdf1a-9e32-445b-b47e-8871123112c8	4d2fc665-6bbd-477e-b08a-b573314fb2c8	Drip Kit D1	Drip irrigation kit 2 hectares	equipment	\N	\N	\N	\N	\N	t	04c6ff18-3cf0-4177-80f1-6a6c21e64e0b	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
6d19fb54-f721-47e5-897f-8ad26a0e484b	d809879c-757f-49a1-a3bd-e3552ed6a6db	Tractor A1	John Deere 5075E for plowing	equipment	\N	\N	\N	\N	\N	t	62b31aed-6162-4e5f-94eb-e946f26dd531	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
dea50987-5cca-4a5a-814b-58988bf30de4	efaee47c-3083-4116-9967-0f60f6dc33b0	Seed Store	Certified seed storage facility	storage	\N	\N	\N	\N	\N	t	eaab8019-49e2-4e4d-8ee2-9bb06a4697c9	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
0b72dbd3-7d8e-424c-9df7-89f7fb677f24	f87121a6-a990-4d15-85d1-e808cdec9465	Harvester H1	Combine harvester for maize	equipment	\N	\N	\N	\N	\N	t	e2023e58-0919-4238-afce-3cd834893c44	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
dc9cfa2e-1aaf-467a-ba69-539922418e08	7c0606ca-8263-4b8a-ba5b-ef4a31662d1d	Storage Silo 1	10-tonne grain storage silo	storage	\N	\N	\N	\N	\N	t	5654c6a6-480b-4a39-ba60-db455ed66d73	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
1cfdc7f5-68a4-4e19-940e-75a4f520352b	7f61920b-c085-43f4-a0c8-f10d53e4f92b	Water Pump P1	Diesel water pump for irrigation	equipment	\N	\N	\N	\N	\N	t	bab59e71-473c-4c73-a6fb-fe31f9d6f28d	2026-05-23 18:19:52.47	2026-05-23 18:19:52.47
\.


--
-- Data for Name: ResourceBooking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceBooking" (id, "resourceId", "memberId", quantity, "startDate", "endDate", status, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RevokedToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RevokedToken" (id, token, "userId", "revokedAt", "expiresAt") FROM stdin;
02f2b4e6-cab5-4186-a0fa-e35101d4da17	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYjg2NjA3NC0wZTFjLTQ0MzEtOTJiZS04NDI5YjU5YmEwMzciLCJwaG9uZSI6IjI1MDc4MDAwMDAwMSIsInJvbGUiOiJzdXBlcl9hZG1pbiIsImlhdCI6MTc3OTQzNzE2MCwiZXhwIjoxNzc5NDM4MDYwfQ.wKjbtJAA5gSB44kfjWGmQm-OcgmUTsa0H6nGmKHG_QM	eb866074-0e1c-4431-92be-8429b59ba037	2026-05-22 08:06:00.294	2026-05-22 08:21:00
8eb41d8b-55f4-4050-9716-3bba63b8c04b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDg3MDQ3ZC00OWMwLTQ0ZDEtYTM3Mi01YzZmYzc3OGVmMjYiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMyIsInJvbGUiOiJvZmZpY2VyIiwiaWF0IjoxNzc5NDM3MzkzLCJleHAiOjE3Nzk0MzgyOTN9.bbAa71wfCMu5GsY0ylrbi7Kiu7IK8vdpIDs84t5DEwk	8487047d-49c0-44d1-a372-5c6fc778ef26	2026-05-22 08:10:10.932	2026-05-22 08:24:53
cddc5428-c75d-4fa2-b282-ae072292969b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDg3MDQ3ZC00OWMwLTQ0ZDEtYTM3Mi01YzZmYzc3OGVmMjYiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMyIsInJvbGUiOiJvZmZpY2VyIiwiaWF0IjoxNzc5NDM4MTYxLCJleHAiOjE3Nzk0MzkwNjF9.T8oiHyUDaqAgsSiEZulvlEhDm2zP32kwBf04hLH8L_E	8487047d-49c0-44d1-a372-5c6fc778ef26	2026-05-22 08:24:09.287	2026-05-22 08:37:41
3f23d99b-919e-4f28-9fb8-d61ec0db17e6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDg3MDQ3ZC00OWMwLTQ0ZDEtYTM3Mi01YzZmYzc3OGVmMjYiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMyIsInJvbGUiOiJvZmZpY2VyIiwiaWF0IjoxNzc5NDM4Mjc0LCJleHAiOjE3Nzk0MzkxNzR9.U-cAFgWJdT7uUVvIQBLCbtnQWxXVCgXl8zMFOb8Swzo	8487047d-49c0-44d1-a372-5c6fc778ef26	2026-05-22 08:32:06.213	2026-05-22 08:39:34
1e322412-091b-488c-8baa-39a4a9c7df1b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDg3MDQ3ZC00OWMwLTQ0ZDEtYTM3Mi01YzZmYzc3OGVmMjYiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMyIsInJvbGUiOiJvZmZpY2VyIiwiaWF0IjoxNzc5NDQxMzYzLCJleHAiOjE3Nzk0NDIyNjN9.VPV1IBG3Gg1VppMtFO0b0wCuAS2VGPRQqi1akRGSbzU	8487047d-49c0-44d1-a372-5c6fc778ef26	2026-05-22 09:16:54.785	2026-05-22 09:31:03
dcf43922-ab37-42cf-9bda-157374b1ca19	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NzA4NGE3Zi0wZGNhLTQ1Y2UtOTA2NC03ZDk2ZDMxMGQxMjQiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3OTQ1MDM1NSwiZXhwIjoxNzc5NDUxMjU1fQ.xyDbYrnCkBFAp7ZhAVPMc3zStpC2I6fZzrcyMUDl8a8	87084a7f-0dca-45ce-9064-7d96d310d124	2026-05-22 11:46:56.652	2026-05-22 12:00:55
d17b171e-3221-4627-8998-05b5b56e9f10	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MGM4MWM5Ni1kMzQyLTQ5NDYtYmZhYy0wZjljMGI5YmYzY2UiLCJwaG9uZSI6IjI1MDc4MDAwMDAwMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3OTYzMDY4NywiZXhwIjoxNzc5NjMxNTg3fQ.YxHgpgZZL4qH138YL0whUV-1e5IiGOUP1umDMduQ6uc	40c81c96-d342-4946-bfac-0f9c0b9bf3ce	2026-05-24 14:03:49.673	2026-05-24 14:06:27
\.


--
-- Data for Name: Sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sensor" (id, "farmerId", "sensorType", "serialNumber", "locationOnFarm", "installationDate", "calibrationDate", "isActive", "lastReadingAt", "batteryLevel", "firmwareVersion", "createdAt", "deletedAt") FROM stdin;
add161bb-f8b9-4382-898c-941ba7d7dd9c	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	soil_moisture	SN-AG-3A6D2C	\N	\N	\N	t	\N	85.00	\N	2026-05-23 18:19:53.126	\N
f882f85f-f379-4eb7-9d7c-f7acb511d2d8	d428d51c-0488-453b-8ad0-27d85c9dd1c3	soil_moisture	SN-AG-9DD1C3	\N	\N	\N	t	\N	77.00	\N	2026-05-23 18:19:53.193	\N
adbb302a-2a4c-4481-835a-ea0f10dc8f96	ddef78d7-c664-4a20-b127-1c960ed27771	soil_moisture	SN-AG-D27771	\N	\N	\N	t	\N	98.00	\N	2026-05-23 18:19:53.207	\N
a70415b0-a59b-4ca0-bbdb-e34159ec40a5	94b406a7-9e49-40df-b43b-a133018ffc5a	soil_moisture	SN-AG-8FFC5A	\N	\N	\N	t	\N	90.00	\N	2026-05-23 18:19:53.222	\N
9087e86b-afb8-44c8-8137-3bd04b18e111	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	soil_moisture	SN-AG-04FB6B	\N	\N	\N	t	\N	77.00	\N	2026-05-23 18:19:53.236	\N
882a5b6f-bb70-4daf-bd39-8c19ee2abf71	64f73446-869b-454c-9a31-ceae1e1997f3	soil_moisture	SN-AG-1997F3	\N	\N	\N	t	\N	96.00	\N	2026-05-23 18:19:53.25	\N
4141cb5c-0eaf-4b54-8c7d-edfa1a3398c8	33825e7e-8324-4d70-9f26-847c8efeb4a0	soil_moisture	SN-AG-FEB4A0	\N	\N	\N	t	\N	76.00	\N	2026-05-23 18:19:53.267	\N
6733d4e8-70a0-40e5-9ab1-392e16bfeca5	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	soil_moisture	SN-AG-44FD87	\N	\N	\N	t	\N	80.00	\N	2026-05-23 18:19:53.279	\N
f1ceecbd-5a1b-43e7-a8e5-b6d011ae36fd	bec2ea24-6d25-4eac-9438-43e316bbe0a8	soil_moisture	SN-AG-BBE0A8	\N	\N	\N	t	\N	85.00	\N	2026-05-23 18:19:53.29	\N
96f18f45-3f2e-4504-a7d8-381291b2062a	12e29d36-12f3-441d-a3ea-3217c53cf276	soil_moisture	SN-AG-3CF276	\N	\N	\N	t	\N	70.00	\N	2026-05-23 18:19:53.302	\N
bc060906-0351-45fa-891b-ecc5f3206b65	cf6650a4-4871-48f9-8bac-33baf26d0eaf	soil_moisture	SN-AG-6D0EAF	\N	\N	\N	t	\N	92.00	\N	2026-05-23 18:19:53.315	\N
1ca8111e-4730-4d28-a44c-5733584b8b81	d5ad6353-7a3e-4225-8e3b-2329357cbc15	soil_moisture	SN-AG-7CBC15	\N	\N	\N	t	\N	82.00	\N	2026-05-23 18:19:53.328	\N
99362996-db42-45ef-8c7f-901cf187a873	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	soil_moisture	SN-AG-ACD6A3	\N	\N	\N	t	\N	65.00	\N	2026-05-23 18:19:53.341	\N
b208f192-4b9b-4e3a-aa51-8041a340b255	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	soil_moisture	SN-AG-E5C78E	\N	\N	\N	t	\N	66.00	\N	2026-05-23 18:19:53.36	\N
01d64948-f2e5-4b12-a8f1-ae9c03378e81	84a8164f-3c51-468d-b547-ec13c0ec9c29	soil_moisture	SN-AG-EC9C29	\N	\N	\N	t	\N	82.00	\N	2026-05-23 18:19:53.373	\N
9445523a-673f-49f3-bd50-2840b5ed5d9b	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	soil_moisture	SN-AG-37EAD5	\N	\N	\N	t	\N	73.00	\N	2026-05-23 18:19:53.386	\N
1113e88c-d684-4bf5-970a-0f332bdbdd1e	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	soil_moisture	SN-AG-9672B7	\N	\N	\N	t	\N	65.00	\N	2026-05-23 18:19:53.399	\N
f219946d-763f-4227-b064-50d5b72871f2	05fe63bf-3cd8-4f76-971f-6a58406cef50	soil_moisture	SN-AG-6CEF50	\N	\N	\N	t	\N	60.00	\N	2026-05-23 18:19:53.413	\N
ecb4d8f7-c04c-4e8b-916a-9f04a044392b	4329428a-aed7-41d1-a866-a04f26504f67	soil_moisture	SN-AG-504F67	\N	\N	\N	t	\N	70.00	\N	2026-05-23 18:19:53.425	\N
a99a11bf-0221-4a05-8ef4-cb5a6d43a045	87880d12-dbc3-4453-bf60-0faced0cbda8	soil_moisture	SN-AG-0CBDA8	\N	\N	\N	t	\N	64.00	\N	2026-05-23 18:19:53.439	\N
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "userId", token, device, "ipAddress", "lastUsedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: SoilReading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SoilReading" (id, "sensorId", "farmerId", "moisturePercent", "temperatureCelsius", "soilTemperatureCelsius", "phLevel", "nitrogenPpm", "phosphorusPpm", "potassiumPpm", "soilHealthScore", "readingAt") FROM stdin;
66dc0f01-0a24-44f8-a3c1-c530e1b7d952	add161bb-f8b9-4382-898c-941ba7d7dd9c	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	28.00	18.00	\N	5.40	\N	\N	\N	\N	2026-05-23 16:19:53.134
8aac08a2-9bc6-48be-8701-fc0bc3b8749e	add161bb-f8b9-4382-898c-941ba7d7dd9c	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	32.00	18.80	\N	5.60	\N	\N	\N	\N	2026-05-23 18:19:53.134
fe094c11-71e0-4d9f-84ab-055104174119	f882f85f-f379-4eb7-9d7c-f7acb511d2d8	d428d51c-0488-453b-8ad0-27d85c9dd1c3	35.00	21.00	\N	5.60	\N	\N	\N	\N	2026-05-23 16:19:53.195
2847278b-ba31-412d-9519-0535692570a6	f882f85f-f379-4eb7-9d7c-f7acb511d2d8	d428d51c-0488-453b-8ad0-27d85c9dd1c3	40.00	22.20	\N	5.80	\N	\N	\N	\N	2026-05-23 18:19:53.195
0b23dd19-57f0-400d-a17a-fc462243bb42	adbb302a-2a4c-4481-835a-ea0f10dc8f96	ddef78d7-c664-4a20-b127-1c960ed27771	42.00	24.00	\N	5.70	\N	\N	\N	\N	2026-05-23 16:19:53.209
ebcaf623-b120-465a-82c7-285ae5063e87	adbb302a-2a4c-4481-835a-ea0f10dc8f96	ddef78d7-c664-4a20-b127-1c960ed27771	48.00	25.60	\N	5.90	\N	\N	\N	\N	2026-05-23 18:19:53.209
0fb43246-d71d-4ab1-bdcf-abab9f7359a6	a70415b0-a59b-4ca0-bbdb-e34159ec40a5	94b406a7-9e49-40df-b43b-a133018ffc5a	49.00	27.00	\N	5.90	\N	\N	\N	\N	2026-05-23 16:19:53.225
bbca2a32-8639-48b5-bb33-87c28db3443e	a70415b0-a59b-4ca0-bbdb-e34159ec40a5	94b406a7-9e49-40df-b43b-a133018ffc5a	56.00	29.00	\N	6.10	\N	\N	\N	\N	2026-05-23 18:19:53.225
d3b009ab-87f9-4ce3-ac57-82b1e510c32e	9087e86b-afb8-44c8-8137-3bd04b18e111	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	56.00	30.00	\N	6.10	\N	\N	\N	\N	2026-05-23 16:19:53.238
f12dcd27-0d91-4467-a2fa-e8bb2f6b5d02	9087e86b-afb8-44c8-8137-3bd04b18e111	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	64.00	30.80	\N	6.30	\N	\N	\N	\N	2026-05-23 18:19:53.238
d9304e03-a792-4064-a420-b6b295ee3c15	882a5b6f-bb70-4daf-bd39-8c19ee2abf71	64f73446-869b-454c-9a31-ceae1e1997f3	63.00	20.00	\N	6.30	\N	\N	\N	\N	2026-05-23 16:19:53.252
c4aaae3f-e0fc-427d-931a-a0d526054b92	882a5b6f-bb70-4daf-bd39-8c19ee2abf71	64f73446-869b-454c-9a31-ceae1e1997f3	67.00	21.20	\N	6.50	\N	\N	\N	\N	2026-05-23 18:19:53.252
060d838a-277d-43c4-8a70-fd47f3c4fd42	4141cb5c-0eaf-4b54-8c7d-edfa1a3398c8	33825e7e-8324-4d70-9f26-847c8efeb4a0	28.00	23.00	\N	6.40	\N	\N	\N	\N	2026-05-23 16:19:53.27
0e9234aa-60ed-4bdd-a837-0f196079bd9f	4141cb5c-0eaf-4b54-8c7d-edfa1a3398c8	33825e7e-8324-4d70-9f26-847c8efeb4a0	33.00	24.60	\N	6.60	\N	\N	\N	\N	2026-05-23 18:19:53.27
2a752020-1f8d-408c-9984-451c877298cc	6733d4e8-70a0-40e5-9ab1-392e16bfeca5	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	35.00	26.00	\N	6.60	\N	\N	\N	\N	2026-05-23 16:19:53.281
6ae8827a-5de2-409f-9aea-43b2f25b3813	6733d4e8-70a0-40e5-9ab1-392e16bfeca5	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	41.00	28.00	\N	6.80	\N	\N	\N	\N	2026-05-23 18:19:53.281
910b4c4a-dacc-4d98-b96d-8d7d3e1a9c90	f1ceecbd-5a1b-43e7-a8e5-b6d011ae36fd	bec2ea24-6d25-4eac-9438-43e316bbe0a8	42.00	29.00	\N	6.80	\N	\N	\N	\N	2026-05-23 16:19:53.292
65b9d931-26b7-430b-a321-0ca098d9ace2	f1ceecbd-5a1b-43e7-a8e5-b6d011ae36fd	bec2ea24-6d25-4eac-9438-43e316bbe0a8	49.00	29.80	\N	7.00	\N	\N	\N	\N	2026-05-23 18:19:53.292
1ddccd99-ef3c-4fe6-a45c-267660714689	96f18f45-3f2e-4504-a7d8-381291b2062a	12e29d36-12f3-441d-a3ea-3217c53cf276	49.00	19.00	\N	6.90	\N	\N	\N	\N	2026-05-23 16:19:53.305
2bcea8d2-2116-441e-b4cb-22a9b7988148	96f18f45-3f2e-4504-a7d8-381291b2062a	12e29d36-12f3-441d-a3ea-3217c53cf276	57.00	20.20	\N	7.10	\N	\N	\N	\N	2026-05-23 18:19:53.305
c4387658-f154-4bd1-9cee-c81dc45ba8e5	bc060906-0351-45fa-891b-ecc5f3206b65	cf6650a4-4871-48f9-8bac-33baf26d0eaf	56.00	22.00	\N	7.10	\N	\N	\N	\N	2026-05-23 16:19:53.317
277597a9-93d8-4944-8ab6-fc42d22d022c	bc060906-0351-45fa-891b-ecc5f3206b65	cf6650a4-4871-48f9-8bac-33baf26d0eaf	60.00	23.60	\N	7.30	\N	\N	\N	\N	2026-05-23 18:19:53.317
f51a5e62-9aca-4d54-9259-68e366c709cf	1ca8111e-4730-4d28-a44c-5733584b8b81	d5ad6353-7a3e-4225-8e3b-2329357cbc15	63.00	25.00	\N	5.50	\N	\N	\N	\N	2026-05-23 16:19:53.33
5999df00-28b1-4438-bbdc-ab942743088d	1ca8111e-4730-4d28-a44c-5733584b8b81	d5ad6353-7a3e-4225-8e3b-2329357cbc15	68.00	27.00	\N	5.70	\N	\N	\N	\N	2026-05-23 18:19:53.33
4ab63da5-2096-4cbb-b90a-fe2a3b7e10cf	99362996-db42-45ef-8c7f-901cf187a873	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	28.00	28.00	\N	5.60	\N	\N	\N	\N	2026-05-23 16:19:53.343
03b57589-9bc0-4f25-8585-d42b4a630929	99362996-db42-45ef-8c7f-901cf187a873	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	34.00	28.80	\N	5.80	\N	\N	\N	\N	2026-05-23 18:19:53.343
eff3511a-41db-4ec8-bee4-5d48d1a06b87	b208f192-4b9b-4e3a-aa51-8041a340b255	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	35.00	18.00	\N	5.80	\N	\N	\N	\N	2026-05-23 16:19:53.363
80d35c86-f313-437c-ad59-6d076b7e1269	b208f192-4b9b-4e3a-aa51-8041a340b255	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	42.00	19.20	\N	6.00	\N	\N	\N	\N	2026-05-23 18:19:53.363
013be63a-74be-4e58-94bc-5c9e7dc5608c	01d64948-f2e5-4b12-a8f1-ae9c03378e81	84a8164f-3c51-468d-b547-ec13c0ec9c29	42.00	21.00	\N	6.00	\N	\N	\N	\N	2026-05-23 16:19:53.375
49db8f40-294c-43d8-acd9-96c052bb44ff	01d64948-f2e5-4b12-a8f1-ae9c03378e81	84a8164f-3c51-468d-b547-ec13c0ec9c29	50.00	22.60	\N	6.20	\N	\N	\N	\N	2026-05-23 18:19:53.375
7574f201-6cdc-49c5-a4dc-1efc182f8ffa	9445523a-673f-49f3-bd50-2840b5ed5d9b	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	49.00	24.00	\N	6.20	\N	\N	\N	\N	2026-05-23 16:19:53.389
3d66150e-94c1-49bf-afce-9cb16b291996	9445523a-673f-49f3-bd50-2840b5ed5d9b	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	53.00	26.00	\N	6.40	\N	\N	\N	\N	2026-05-23 18:19:53.389
c52b7a9a-4305-4439-8a05-ec4c59225567	1113e88c-d684-4bf5-970a-0f332bdbdd1e	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	56.00	27.00	\N	6.30	\N	\N	\N	\N	2026-05-23 16:19:53.401
698a6f43-c5cf-4e41-9a18-be5a1036b51f	1113e88c-d684-4bf5-970a-0f332bdbdd1e	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	61.00	27.80	\N	6.50	\N	\N	\N	\N	2026-05-23 18:19:53.401
4942aeaf-593c-473e-9c8d-3717da4406c6	f219946d-763f-4227-b064-50d5b72871f2	05fe63bf-3cd8-4f76-971f-6a58406cef50	63.00	30.00	\N	6.50	\N	\N	\N	\N	2026-05-23 16:19:53.415
b8da1042-7146-4f33-a994-f5a1a4a8c866	f219946d-763f-4227-b064-50d5b72871f2	05fe63bf-3cd8-4f76-971f-6a58406cef50	69.00	31.20	\N	6.70	\N	\N	\N	\N	2026-05-23 18:19:53.415
48ff3afc-618b-41fb-8ecb-9b4029e8c622	ecb4d8f7-c04c-4e8b-916a-9f04a044392b	4329428a-aed7-41d1-a866-a04f26504f67	28.00	20.00	\N	6.70	\N	\N	\N	\N	2026-05-23 16:19:53.428
d3fef11b-1746-44e9-b95b-5581ba7b9767	ecb4d8f7-c04c-4e8b-916a-9f04a044392b	4329428a-aed7-41d1-a866-a04f26504f67	35.00	21.60	\N	6.90	\N	\N	\N	\N	2026-05-23 18:19:53.428
f3fe2eb5-7dbe-4822-9b1f-dc7aa2063325	a99a11bf-0221-4a05-8ef4-cb5a6d43a045	87880d12-dbc3-4453-bf60-0faced0cbda8	35.00	23.00	\N	6.80	\N	\N	\N	\N	2026-05-23 16:19:53.447
85fb0e9f-995e-417b-86bd-f76b653cf686	a99a11bf-0221-4a05-8ef4-cb5a6d43a045	87880d12-dbc3-4453-bf60-0faced0cbda8	43.00	25.00	\N	7.00	\N	\N	\N	\N	2026-05-23 18:19:53.447
\.


--
-- Data for Name: SupportTicket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SupportTicket" (id, "farmerId", subject, message, status, "adminReply", "createdAt", "resolvedAt") FROM stdin;
\.


--
-- Data for Name: SystemHealth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemHealth" (id, "serviceName", status, "uptimePercent", "responseTimeMs", "errorCount", "lastCheckAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (key, value, description, "updatedAt") FROM stdin;
notifications.sms	true	\N	2026-05-22 08:02:55.733
notifications.email	true	\N	2026-05-22 08:02:57.437
notifications.push	true	\N	2026-05-22 08:02:59.792
week1SmokeTest	"ok"	\N	2026-05-23 19:41:16.786
notifications	{"pushEnabled":true,"emailEnabled":true,"smsEnabled":true}	\N	2026-05-23 19:41:16.788
smsEnabled	true	\N	2026-05-24 13:55:31.902
pushEnabled	true	\N	2026-05-24 13:55:31.949
emailEnabled	true	\N	2026-05-24 13:55:31.951
weeklySummaryEnabled	true	\N	2026-05-24 13:55:31.952
securityLogAlertsEnabled	false	\N	2026-05-24 13:55:31.953
cooperativeRegistrationAlertsEnabled	true	\N	2026-05-24 13:55:31.955
requireGpsVerification	true	\N	2026-05-24 13:55:31.956
autoApproveSmallHarvests	true	\N	2026-05-24 13:55:31.957
moistureThreshold	30	\N	2026-05-24 13:55:31.957
yieldBoundary	50	\N	2026-05-24 13:55:31.958
financialVariance	15	\N	2026-05-24 13:55:31.959
realTimeWeatherSyncEnabled	true	\N	2026-05-24 13:55:31.96
marketPriceSyncEnabled	true	\N	2026-05-24 13:55:31.962
autoReportFrequency	"daily"	\N	2026-05-24 13:55:31.963
reportRecipients	"agukaadmin@gmail.com"	\N	2026-05-24 13:55:31.965
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, phone, email, "passwordHash", role, language, status, "isActive", "createdAt", "updatedAt", "avatarUrl", cell, "deletedAt", district, "fullName", "hasMarketAccess", "hasSensorAccess", "isApproved", "isOnboarded", province, sector, "serviceAccessExpiresAt", "subscriptionExpiresAt", "subscriptionType", village, "requiresPasswordChange") FROM stdin;
7277397f-885a-4623-8dc6-4cdcc676a740	250780000003	officer1@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	officer	kinyarwanda	active	t	2026-05-23 18:19:51.675	2026-05-24 13:18:30.799	\N		\N		Umujyanama	f	f	t	f			\N	\N	free		f
40c81c96-d342-4946-bfac-0f9c0b9bf3ce	250780000002	agukaadmin@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	admin	kinyarwanda	active	t	2026-05-23 18:19:51.548	2026-05-24 13:51:46.544	\N		\N			f	f	t	f			\N	\N	free		f
12a82e78-e8ef-4197-a39f-055f8ea9f4f9	250788300005	theophile.ntu@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.69	2026-05-24 13:52:46.452	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
66529a0f-42aa-4bb1-899f-a3b947ef77b5	250788300020	alice.nyira@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.936	2026-05-24 13:53:14.412	\N	\N	\N	\N	\N	f	f	t	t	\N	\N	\N	\N	free	\N	f
b43dbcf0-3e13-4555-845a-9f2f9f86aac9	250780000004	officer2@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	officer	kinyarwanda	active	t	2026-05-23 18:19:51.697	2026-05-23 18:19:51.697	\N	\N	\N	\N	Eric Ndayisaba	f	f	t	f	\N	\N	\N	\N	free	\N	f
5a07c37b-2735-48d8-bcca-46032d90d223	250780000001	superadmin@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	super_admin	kinyarwanda	active	t	2026-05-23 18:19:51.426	2026-05-23 18:19:51.426	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
71e4bf77-39be-4ae0-95a5-c126e1722085	250788200002	manager.rubavu@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.348	2026-05-23 18:19:52.348	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
bab59e71-473c-4c73-a6fb-fe31f9d6f28d	250788200004	manager.bugesera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.357	2026-05-23 18:19:52.357	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
e2023e58-0919-4238-afce-3cd834893c44	250788200005	manager.kayonza@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.362	2026-05-23 18:19:52.362	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
1d597f3b-0606-4cd8-b07f-40ff018edc11	250788200007	manager.burera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.368	2026-05-23 18:19:52.368	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
04c6ff18-3cf0-4177-80f1-6a6c21e64e0b	250788200009	manager.ruhango@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.375	2026-05-23 18:19:52.375	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
0b2c120c-775a-4154-a7d3-07cff971c58d	250788300001	jean.habimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.574	2026-05-23 18:19:52.574	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
711203c6-c180-4223-879e-9d463585c4c5	250788300002	solange.uwimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.637	2026-05-23 18:19:52.637	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
e4f54045-383b-42b5-8188-908a3cb1e609	250788300003	celestin.bizimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.654	2026-05-23 18:19:52.654	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
f2ba3f7d-b893-4207-8993-fd515f1317a7	250788300004	claudine.mukand@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.672	2026-05-23 18:19:52.672	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
d568b895-a408-4567-b424-5a6977520c7e	250788300006	immacule.uwera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.705	2026-05-23 18:19:52.705	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
faeadf19-58b0-4789-9fcc-38f11f201db5	250788300007	evariste.nzig@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.723	2026-05-23 18:19:52.723	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
2a3236f2-acb6-4224-a92d-39d1bf22eb29	250788300008	vestine.nkusi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.741	2026-05-23 18:19:52.741	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
0def7d07-b20a-41b0-b5b6-8fd6b9718862	250788300009	patrice.mugabo@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.758	2026-05-23 18:19:52.758	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
34e952f9-b2d6-4356-8f4b-d4bd224c104c	250788300010	domitille.uwim@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.774	2026-05-23 18:19:52.774	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
f2fe5e40-4db5-4935-859f-06a5a9ffd411	250788300011	alexis.mugenzi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.794	2026-05-23 18:19:52.794	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
5546ec0e-8140-4b35-97e2-020cce335b95	250788300012	chantal.nkuru@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.81	2026-05-23 18:19:52.81	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
75cd296f-fa7e-4860-a2b9-55860b5285e5	250788300013	felix.rutageng@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.828	2026-05-23 18:19:52.828	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
eac8772a-d5c1-4e27-820f-a423ce7103d1	250788300014	fidele.nshimi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.845	2026-05-23 18:19:52.845	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
e25de794-13b3-442e-8137-c991484336a7	250788300015	odette.ingab@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.862	2026-05-23 18:19:52.862	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
e2983090-c933-4e24-816e-8020e21a5ddb	250788300016	theogene.mug@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.876	2026-05-23 18:19:52.876	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
70bae911-fbbd-422d-9257-18605e8d4b84	250788300017	jeanpaul.hab@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.891	2026-05-23 18:19:52.891	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
186fab6d-5d01-46b0-805c-1c1f49dac418	250788300018	yvonne.mutuy@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.908	2026-05-23 18:19:52.908	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
61ae4c39-4af8-4205-9a12-3b5d4d509388	250788300019	gabriel.niyonz@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	farmer	kinyarwanda	active	t	2026-05-23 18:19:52.921	2026-05-23 18:19:52.921	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
eaab8019-49e2-4e4d-8ee2-9bb06a4697c9	250788200006	manager.nyamasheke@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.365	2026-05-23 18:19:52.365	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
62b31aed-6162-4e5f-94eb-e946f26dd531	250788200001	manager.kinigi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.347	2026-05-23 18:19:52.347	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
b72925ef-d55d-453b-b911-4fa911a7e94e	250788200008	manager.nyamagabe@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.373	2026-05-23 18:19:52.373	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
5654c6a6-480b-4a39-ba60-db455ed66d73	250788200003	manager.huye@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.352	2026-05-23 18:19:52.352	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
94a83477-a836-470f-be6d-8ce19dac39e0	250788200010	manager.rulindo@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$TSqpsdAUiBM7EN9iO0cdXw$uuYnUHwbUX+ZGTS/dBsUKGd8WV+Ws2tBJR6ZpKNK2sY	cooperative	kinyarwanda	active	t	2026-05-23 18:19:52.377	2026-05-23 18:19:52.377	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	\N	free	\N	f
\.


--
-- Data for Name: WeatherReading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WeatherReading" (id, "farmerId", "weatherStationId", "temperatureCelsius", "humidityPercent", "rainfallMm", "windSpeedKmh", "windDirection", "pressureHpa", "uvIndex", "solarRadiationWm2", forecast24hr, forecast7day, "readingAt") FROM stdin;
b868e811-0c61-4923-9d68-64d22f2841a5	f416cdc2-e7db-447e-b594-8b4a2a3a6d2c	\N	20.00	52.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.168
37ef20b5-63d6-4285-be48-7a0d8a660bd7	d428d51c-0488-453b-8ad0-27d85c9dd1c3	\N	23.00	57.00	1.70	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.201
7fac1e20-8f92-4310-a44c-fb95822023b2	ddef78d7-c664-4a20-b127-1c960ed27771	\N	26.00	62.00	3.40	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.216
4d5cf635-a677-4e15-a491-adec97d86d61	94b406a7-9e49-40df-b43b-a133018ffc5a	\N	29.00	67.00	5.10	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.231
7927dcb0-5416-4aa1-9396-267f30088a8c	abfbf812-0dc4-4584-aa4c-cca80d04fb6b	\N	32.00	72.00	6.80	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.244
c9c4669f-bf52-4f52-af41-dd5d39b4e4be	64f73446-869b-454c-9a31-ceae1e1997f3	\N	22.00	77.00	8.50	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.257
947f3b2b-9717-4a67-83c8-42ca28c22447	33825e7e-8324-4d70-9f26-847c8efeb4a0	\N	25.00	82.00	10.20	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.274
b8c9691b-5968-4bbe-90c1-ba46a59c048c	0fb2e1a6-105f-4a37-9e6a-230bb744fd87	\N	28.00	53.00	11.90	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.286
a556d273-8a1e-4a63-b499-b9a0fdbb7755	bec2ea24-6d25-4eac-9438-43e316bbe0a8	\N	31.00	58.00	1.60	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.297
c0c5c6a0-1d4b-40fb-883d-cf3cb68b13cc	12e29d36-12f3-441d-a3ea-3217c53cf276	\N	21.00	63.00	3.30	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.31
8622aaf4-a597-4081-aa33-eee7d863dc02	cf6650a4-4871-48f9-8bac-33baf26d0eaf	\N	24.00	68.00	5.00	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.323
587b306e-67cc-487a-b8ed-90c7dd2dccec	d5ad6353-7a3e-4225-8e3b-2329357cbc15	\N	27.00	73.00	6.70	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.336
3144ef65-2d67-4eb9-83b2-8fa6d83a990e	ac0c99f2-ff9d-4da3-8394-b4f2eeacd6a3	\N	30.00	78.00	8.40	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.355
f7c1592d-06cb-4053-8bd7-a5d1d8a2621a	9a7ae355-2606-4ad7-bbc5-260c76e5c78e	\N	20.00	83.00	10.10	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.368
4885fae0-1390-4f9b-803c-64e369cdc12b	84a8164f-3c51-468d-b547-ec13c0ec9c29	\N	23.00	54.00	11.80	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.381
bf68cd26-973e-4a99-bb27-f7efd5f0d2ad	896aea8f-c4b3-4aec-9e79-dbc2d337ead5	\N	26.00	59.00	1.50	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.394
50fb31eb-4d60-40b3-bf0a-e924f7bbedcf	4b98763f-7f2c-44d1-b1c7-2214bd9672b7	\N	29.00	64.00	3.20	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.407
4c98c1cd-f51d-433c-bf46-88eb6fa6348d	05fe63bf-3cd8-4f76-971f-6a58406cef50	\N	32.00	69.00	4.90	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.42
88ba6d52-975c-4685-b1e3-c61d5d93bcd7	4329428a-aed7-41d1-a866-a04f26504f67	\N	22.00	74.00	6.60	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.433
95e32517-2373-4fff-88e6-ca9f164baa89	87880d12-dbc3-4453-bf60-0faced0cbda8	\N	25.00	79.00	8.30	\N	\N	\N	\N	\N	\N	\N	2026-05-23 18:19:53.452
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
d40909ef-9f44-49e2-8d16-0db845551d99	904f18dc9c227e504a965b031dbf4f497ccabead4a0997a0f63dbced2b6ac3e5	2026-05-15 15:56:13.317268+02	20260426102423_init_schema_and_improvements	\N	\N	2026-05-15 15:56:12.395859+02	1
4e887e17-c036-4f95-9bee-d6a586419dea	11c4443b9dfd9e5ff8ff71cc4e66095b5e7746fb7e0584e4199fb249924915ef	2026-05-15 15:56:13.372938+02	20260426104144_add_support_tickets_and_alert_fields	\N	\N	2026-05-15 15:56:13.318646+02	1
744ef988-ae41-4999-8697-62813c8a0c92	0c53e82a061bd7aff81aa879bfaf7f6cbcba894b9d5161bf7f11fa1762a11469	2026-05-23 20:55:23.566785+02	20260523000100_add_backup_restored_at	\N	\N	2026-05-23 20:55:23.352973+02	1
\.


--
-- Data for Name: farmer_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farmer_files (id, farmer_id, file_type, file_path, uploaded_at) FROM stdin;
\.


--
-- Name: farmer_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.farmer_files_id_seq', 1, false);


--
-- Name: Alert Alert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT "Alert_pkey" PRIMARY KEY (id);


--
-- Name: Announcement Announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Backup Backup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Backup"
    ADD CONSTRAINT "Backup_pkey" PRIMARY KEY (id);


--
-- Name: BulkOrder BulkOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BulkOrder"
    ADD CONSTRAINT "BulkOrder_pkey" PRIMARY KEY (id);


--
-- Name: Certificate Certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_pkey" PRIMARY KEY (id);


--
-- Name: CooperativeActivity CooperativeActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeActivity"
    ADD CONSTRAINT "CooperativeActivity_pkey" PRIMARY KEY (id);


--
-- Name: CooperativeMember CooperativeMember_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeMember"
    ADD CONSTRAINT "CooperativeMember_pkey" PRIMARY KEY (id);


--
-- Name: CooperativeProfile CooperativeProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeProfile"
    ADD CONSTRAINT "CooperativeProfile_pkey" PRIMARY KEY (id);


--
-- Name: CooperativeReport CooperativeReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeReport"
    ADD CONSTRAINT "CooperativeReport_pkey" PRIMARY KEY (id);


--
-- Name: Cooperative Cooperative_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cooperative"
    ADD CONSTRAINT "Cooperative_pkey" PRIMARY KEY (id);


--
-- Name: Crop Crop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Crop"
    ADD CONSTRAINT "Crop_pkey" PRIMARY KEY (id);


--
-- Name: Device Device_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_pkey" PRIMARY KEY (id);


--
-- Name: ExtensionOfficerAssignment ExtensionOfficerAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExtensionOfficerAssignment"
    ADD CONSTRAINT "ExtensionOfficerAssignment_pkey" PRIMARY KEY (id);


--
-- Name: ExtensionOfficerProfile ExtensionOfficerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExtensionOfficerProfile"
    ADD CONSTRAINT "ExtensionOfficerProfile_pkey" PRIMARY KEY (id);


--
-- Name: FarmActivity FarmActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmActivity"
    ADD CONSTRAINT "FarmActivity_pkey" PRIMARY KEY (id);


--
-- Name: FarmerCrop FarmerCrop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerCrop"
    ADD CONSTRAINT "FarmerCrop_pkey" PRIMARY KEY (id);


--
-- Name: FarmerProfile FarmerProfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerProfile"
    ADD CONSTRAINT "FarmerProfile_pkey" PRIMARY KEY (id);


--
-- Name: Feedback Feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY (id);


--
-- Name: ForumComment ForumComment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumComment"
    ADD CONSTRAINT "ForumComment_pkey" PRIMARY KEY (id);


--
-- Name: ForumPost ForumPost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_pkey" PRIMARY KEY (id);


--
-- Name: GroupMessage GroupMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupMessage"
    ADD CONSTRAINT "GroupMessage_pkey" PRIMARY KEY (id);


--
-- Name: IrrigationLog IrrigationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationLog"
    ADD CONSTRAINT "IrrigationLog_pkey" PRIMARY KEY (id);


--
-- Name: IrrigationSchedule IrrigationSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationSchedule"
    ADD CONSTRAINT "IrrigationSchedule_pkey" PRIMARY KEY (id);


--
-- Name: IrrigationZone IrrigationZone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationZone"
    ADD CONSTRAINT "IrrigationZone_pkey" PRIMARY KEY (id);


--
-- Name: Livestock Livestock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Livestock"
    ADD CONSTRAINT "Livestock_pkey" PRIMARY KEY (id);


--
-- Name: MarketPrice MarketPrice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MarketPrice"
    ADD CONSTRAINT "MarketPrice_pkey" PRIMARY KEY (id);


--
-- Name: MarketplaceListing MarketplaceListing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MarketplaceListing"
    ADD CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY (id);


--
-- Name: NotificationRule NotificationRule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationRule"
    ADD CONSTRAINT "NotificationRule_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OTP OTP_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OTP"
    ADD CONSTRAINT "OTP_pkey" PRIMARY KEY (id);


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PriceAlert PriceAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PriceAlert"
    ADD CONSTRAINT "PriceAlert_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: ResourceBooking ResourceBooking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceBooking"
    ADD CONSTRAINT "ResourceBooking_pkey" PRIMARY KEY (id);


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: RevokedToken RevokedToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RevokedToken"
    ADD CONSTRAINT "RevokedToken_pkey" PRIMARY KEY (id);


--
-- Name: Sensor Sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sensor"
    ADD CONSTRAINT "Sensor_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SoilReading SoilReading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SoilReading"
    ADD CONSTRAINT "SoilReading_pkey" PRIMARY KEY (id);


--
-- Name: SupportTicket SupportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY (id);


--
-- Name: SystemHealth SystemHealth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemHealth"
    ADD CONSTRAINT "SystemHealth_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (key);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeatherReading WeatherReading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WeatherReading"
    ADD CONSTRAINT "WeatherReading_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: farmer_files farmer_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farmer_files
    ADD CONSTRAINT farmer_files_pkey PRIMARY KEY (id);


--
-- Name: Alert_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_createdAt_idx" ON public."Alert" USING btree ("createdAt");


--
-- Name: Alert_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_farmerId_idx" ON public."Alert" USING btree ("farmerId");


--
-- Name: Alert_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Alert_isRead_idx" ON public."Alert" USING btree ("isRead");


--
-- Name: Announcement_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Announcement_cooperativeId_idx" ON public."Announcement" USING btree ("cooperativeId");


--
-- Name: Announcement_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Announcement_priority_idx" ON public."Announcement" USING btree (priority);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: BulkOrder_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BulkOrder_cooperativeId_idx" ON public."BulkOrder" USING btree ("cooperativeId");


--
-- Name: BulkOrder_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BulkOrder_status_idx" ON public."BulkOrder" USING btree (status);


--
-- Name: Certificate_certNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Certificate_certNumber_key" ON public."Certificate" USING btree ("certNumber");


--
-- Name: Certificate_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Certificate_farmerId_idx" ON public."Certificate" USING btree ("farmerId");


--
-- Name: Certificate_officerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Certificate_officerId_idx" ON public."Certificate" USING btree ("officerId");


--
-- Name: CooperativeActivity_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeActivity_cooperativeId_idx" ON public."CooperativeActivity" USING btree ("cooperativeId");


--
-- Name: CooperativeActivity_scheduledAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeActivity_scheduledAt_idx" ON public."CooperativeActivity" USING btree ("scheduledAt");


--
-- Name: CooperativeActivity_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeActivity_status_idx" ON public."CooperativeActivity" USING btree (status);


--
-- Name: CooperativeMember_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeMember_cooperativeId_idx" ON public."CooperativeMember" USING btree ("cooperativeId");


--
-- Name: CooperativeMember_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeMember_status_idx" ON public."CooperativeMember" USING btree (status);


--
-- Name: CooperativeMember_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CooperativeMember_userId_key" ON public."CooperativeMember" USING btree ("userId");


--
-- Name: CooperativeProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CooperativeProfile_userId_key" ON public."CooperativeProfile" USING btree ("userId");


--
-- Name: CooperativeReport_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeReport_cooperativeId_idx" ON public."CooperativeReport" USING btree ("cooperativeId");


--
-- Name: CooperativeReport_reportType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeReport_reportType_idx" ON public."CooperativeReport" USING btree ("reportType");


--
-- Name: Cooperative_district_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cooperative_district_idx" ON public."Cooperative" USING btree (district);


--
-- Name: Cooperative_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cooperative_isActive_idx" ON public."Cooperative" USING btree ("isActive");


--
-- Name: Cooperative_registrationNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cooperative_registrationNumber_key" ON public."Cooperative" USING btree ("registrationNumber");


--
-- Name: Crop_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Crop_category_idx" ON public."Crop" USING btree (category);


--
-- Name: Device_fcmToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Device_fcmToken_idx" ON public."Device" USING btree ("fcmToken");


--
-- Name: Device_fcmToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Device_fcmToken_key" ON public."Device" USING btree ("fcmToken");


--
-- Name: Device_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Device_userId_idx" ON public."Device" USING btree ("userId");


--
-- Name: ExtensionOfficerAssignment_extensionOfficerId_farmerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ExtensionOfficerAssignment_extensionOfficerId_farmerId_key" ON public."ExtensionOfficerAssignment" USING btree ("extensionOfficerId", "farmerId");


--
-- Name: ExtensionOfficerProfile_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ExtensionOfficerProfile_employeeId_key" ON public."ExtensionOfficerProfile" USING btree ("employeeId");


--
-- Name: ExtensionOfficerProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ExtensionOfficerProfile_userId_key" ON public."ExtensionOfficerProfile" USING btree ("userId");


--
-- Name: FarmActivity_activityDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmActivity_activityDate_idx" ON public."FarmActivity" USING btree ("activityDate");


--
-- Name: FarmActivity_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmActivity_farmerId_idx" ON public."FarmActivity" USING btree ("farmerId");


--
-- Name: FarmerCrop_cropId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerCrop_cropId_idx" ON public."FarmerCrop" USING btree ("cropId");


--
-- Name: FarmerCrop_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerCrop_farmerId_idx" ON public."FarmerCrop" USING btree ("farmerId");


--
-- Name: FarmerCrop_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerCrop_status_idx" ON public."FarmerCrop" USING btree (status);


--
-- Name: FarmerProfile_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerProfile_cooperativeId_idx" ON public."FarmerProfile" USING btree ("cooperativeId");


--
-- Name: FarmerProfile_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerProfile_userId_idx" ON public."FarmerProfile" USING btree ("userId");


--
-- Name: FarmerProfile_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FarmerProfile_userId_key" ON public."FarmerProfile" USING btree ("userId");


--
-- Name: Feedback_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_category_idx" ON public."Feedback" USING btree (category);


--
-- Name: Feedback_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_createdAt_idx" ON public."Feedback" USING btree ("createdAt");


--
-- Name: Feedback_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_rating_idx" ON public."Feedback" USING btree (rating);


--
-- Name: Feedback_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_status_idx" ON public."Feedback" USING btree (status);


--
-- Name: Feedback_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_type_idx" ON public."Feedback" USING btree (type);


--
-- Name: Feedback_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Feedback_userId_idx" ON public."Feedback" USING btree ("userId");


--
-- Name: ForumComment_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumComment_postId_idx" ON public."ForumComment" USING btree ("postId");


--
-- Name: ForumPost_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_cooperativeId_idx" ON public."ForumPost" USING btree ("cooperativeId");


--
-- Name: ForumPost_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_farmerId_idx" ON public."ForumPost" USING btree ("farmerId");


--
-- Name: GroupMessage_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GroupMessage_cooperativeId_idx" ON public."GroupMessage" USING btree ("cooperativeId");


--
-- Name: GroupMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GroupMessage_createdAt_idx" ON public."GroupMessage" USING btree ("createdAt");


--
-- Name: IrrigationLog_executedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationLog_executedAt_idx" ON public."IrrigationLog" USING btree ("executedAt");


--
-- Name: IrrigationLog_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationLog_farmerId_idx" ON public."IrrigationLog" USING btree ("farmerId");


--
-- Name: IrrigationLog_startTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationLog_startTime_idx" ON public."IrrigationLog" USING btree ("startTime");


--
-- Name: IrrigationLog_zoneId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationLog_zoneId_idx" ON public."IrrigationLog" USING btree ("zoneId");


--
-- Name: IrrigationSchedule_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationSchedule_farmerId_idx" ON public."IrrigationSchedule" USING btree ("farmerId");


--
-- Name: IrrigationSchedule_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationSchedule_isActive_idx" ON public."IrrigationSchedule" USING btree ("isActive");


--
-- Name: IrrigationZone_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IrrigationZone_farmerId_idx" ON public."IrrigationZone" USING btree ("farmerId");


--
-- Name: Livestock_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Livestock_farmerId_idx" ON public."Livestock" USING btree ("farmerId");


--
-- Name: Livestock_tagNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Livestock_tagNumber_key" ON public."Livestock" USING btree ("tagNumber");


--
-- Name: MarketPrice_cropId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MarketPrice_cropId_idx" ON public."MarketPrice" USING btree ("cropId");


--
-- Name: MarketPrice_cropId_marketId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MarketPrice_cropId_marketId_key" ON public."MarketPrice" USING btree ("cropId", "marketId");


--
-- Name: MarketPrice_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MarketPrice_marketId_idx" ON public."MarketPrice" USING btree ("marketId");


--
-- Name: MarketPrice_recordedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MarketPrice_recordedAt_idx" ON public."MarketPrice" USING btree ("recordedAt");


--
-- Name: MarketplaceListing_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MarketplaceListing_cooperativeId_idx" ON public."MarketplaceListing" USING btree ("cooperativeId");


--
-- Name: MarketplaceListing_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MarketplaceListing_status_idx" ON public."MarketplaceListing" USING btree (status);


--
-- Name: NotificationRule_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationRule_type_idx" ON public."NotificationRule" USING btree (type);


--
-- Name: NotificationRule_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationRule_userId_idx" ON public."NotificationRule" USING btree ("userId");


--
-- Name: Notification_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_status_idx" ON public."Notification" USING btree (status);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Notification_userId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_userId_status_idx" ON public."Notification" USING btree ("userId", status);


--
-- Name: OTP_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OTP_phone_idx" ON public."OTP" USING btree (phone);


--
-- Name: PasswordResetToken_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_createdAt_idx" ON public."PasswordResetToken" USING btree ("createdAt");


--
-- Name: PasswordResetToken_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PasswordResetToken_phone_idx" ON public."PasswordResetToken" USING btree (phone);


--
-- Name: Payment_reference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_reference_idx" ON public."Payment" USING btree (reference);


--
-- Name: Payment_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_reference_key" ON public."Payment" USING btree (reference);


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: Payment_transactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_transactionId_idx" ON public."Payment" USING btree ("transactionId");


--
-- Name: Payment_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_userId_idx" ON public."Payment" USING btree ("userId");


--
-- Name: PriceAlert_cropId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PriceAlert_cropId_idx" ON public."PriceAlert" USING btree ("cropId");


--
-- Name: PriceAlert_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PriceAlert_isActive_idx" ON public."PriceAlert" USING btree ("isActive");


--
-- Name: PriceAlert_isTriggered_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PriceAlert_isTriggered_idx" ON public."PriceAlert" USING btree ("isTriggered");


--
-- Name: PriceAlert_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PriceAlert_userId_idx" ON public."PriceAlert" USING btree ("userId");


--
-- Name: RefreshToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_token_idx" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: Refund_paymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_paymentId_idx" ON public."Refund" USING btree ("paymentId");


--
-- Name: Refund_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Refund_status_idx" ON public."Refund" USING btree (status);


--
-- Name: Report_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_farmerId_idx" ON public."Report" USING btree ("farmerId");


--
-- Name: Report_reportType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_reportType_idx" ON public."Report" USING btree ("reportType");


--
-- Name: ResourceBooking_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceBooking_resourceId_idx" ON public."ResourceBooking" USING btree ("resourceId");


--
-- Name: ResourceBooking_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceBooking_status_idx" ON public."ResourceBooking" USING btree (status);


--
-- Name: Resource_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_cooperativeId_idx" ON public."Resource" USING btree ("cooperativeId");


--
-- Name: Resource_resourceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_resourceType_idx" ON public."Resource" USING btree ("resourceType");


--
-- Name: RevokedToken_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RevokedToken_token_idx" ON public."RevokedToken" USING btree (token);


--
-- Name: RevokedToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RevokedToken_token_key" ON public."RevokedToken" USING btree (token);


--
-- Name: Sensor_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sensor_farmerId_idx" ON public."Sensor" USING btree ("farmerId");


--
-- Name: Sensor_serialNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sensor_serialNumber_key" ON public."Sensor" USING btree ("serialNumber");


--
-- Name: Session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_token_key" ON public."Session" USING btree (token);


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: SoilReading_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SoilReading_farmerId_idx" ON public."SoilReading" USING btree ("farmerId");


--
-- Name: SoilReading_farmerId_readingAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SoilReading_farmerId_readingAt_idx" ON public."SoilReading" USING btree ("farmerId", "readingAt");


--
-- Name: SoilReading_readingAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SoilReading_readingAt_idx" ON public."SoilReading" USING btree ("readingAt");


--
-- Name: SupportTicket_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_farmerId_idx" ON public."SupportTicket" USING btree ("farmerId");


--
-- Name: SupportTicket_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SupportTicket_status_idx" ON public."SupportTicket" USING btree (status);


--
-- Name: SystemHealth_serviceName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SystemHealth_serviceName_key" ON public."SystemHealth" USING btree ("serviceName");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_isApproved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_isApproved_idx" ON public."User" USING btree ("isApproved");


--
-- Name: User_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_phone_idx" ON public."User" USING btree (phone);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: WeatherReading_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WeatherReading_farmerId_idx" ON public."WeatherReading" USING btree ("farmerId");


--
-- Name: WeatherReading_farmerId_readingAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WeatherReading_farmerId_readingAt_idx" ON public."WeatherReading" USING btree ("farmerId", "readingAt");


--
-- Name: WeatherReading_readingAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WeatherReading_readingAt_idx" ON public."WeatherReading" USING btree ("readingAt");


--
-- Name: idx_farmer_files_farmer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_farmer_files_farmer_id ON public.farmer_files USING btree (farmer_id);


--
-- Name: Alert Alert_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT "Alert_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Alert Alert_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Alert"
    ADD CONSTRAINT "Alert_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcement Announcement_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcement"
    ADD CONSTRAINT "Announcement_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BulkOrder BulkOrder_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BulkOrder"
    ADD CONSTRAINT "BulkOrder_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CooperativeActivity CooperativeActivity_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeActivity"
    ADD CONSTRAINT "CooperativeActivity_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CooperativeMember CooperativeMember_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeMember"
    ADD CONSTRAINT "CooperativeMember_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CooperativeMember CooperativeMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeMember"
    ADD CONSTRAINT "CooperativeMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CooperativeProfile CooperativeProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeProfile"
    ADD CONSTRAINT "CooperativeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CooperativeReport CooperativeReport_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeReport"
    ADD CONSTRAINT "CooperativeReport_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Device Device_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Device"
    ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionOfficerAssignment ExtensionOfficerAssignment_extensionOfficerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExtensionOfficerAssignment"
    ADD CONSTRAINT "ExtensionOfficerAssignment_extensionOfficerId_fkey" FOREIGN KEY ("extensionOfficerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionOfficerAssignment ExtensionOfficerAssignment_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExtensionOfficerAssignment"
    ADD CONSTRAINT "ExtensionOfficerAssignment_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ExtensionOfficerProfile ExtensionOfficerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ExtensionOfficerProfile"
    ADD CONSTRAINT "ExtensionOfficerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FarmActivity FarmActivity_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmActivity"
    ADD CONSTRAINT "FarmActivity_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FarmerCrop FarmerCrop_cropId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerCrop"
    ADD CONSTRAINT "FarmerCrop_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES public."Crop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FarmerCrop FarmerCrop_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerCrop"
    ADD CONSTRAINT "FarmerCrop_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FarmerProfile FarmerProfile_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerProfile"
    ADD CONSTRAINT "FarmerProfile_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FarmerProfile FarmerProfile_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerProfile"
    ADD CONSTRAINT "FarmerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Feedback Feedback_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Feedback"
    ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumComment ForumComment_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumComment"
    ADD CONSTRAINT "ForumComment_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumComment ForumComment_parentCommentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumComment"
    ADD CONSTRAINT "ForumComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES public."ForumComment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ForumComment ForumComment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumComment"
    ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumPost ForumPost_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GroupMessage GroupMessage_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GroupMessage"
    ADD CONSTRAINT "GroupMessage_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IrrigationLog IrrigationLog_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationLog"
    ADD CONSTRAINT "IrrigationLog_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IrrigationLog IrrigationLog_scheduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationLog"
    ADD CONSTRAINT "IrrigationLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES public."IrrigationSchedule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: IrrigationLog IrrigationLog_zoneId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationLog"
    ADD CONSTRAINT "IrrigationLog_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES public."IrrigationZone"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: IrrigationSchedule IrrigationSchedule_cropId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationSchedule"
    ADD CONSTRAINT "IrrigationSchedule_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES public."FarmerCrop"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: IrrigationSchedule IrrigationSchedule_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationSchedule"
    ADD CONSTRAINT "IrrigationSchedule_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: IrrigationZone IrrigationZone_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."IrrigationZone"
    ADD CONSTRAINT "IrrigationZone_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Livestock Livestock_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Livestock"
    ADD CONSTRAINT "Livestock_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketPrice MarketPrice_cropId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MarketPrice"
    ADD CONSTRAINT "MarketPrice_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES public."Crop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MarketplaceListing MarketplaceListing_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MarketplaceListing"
    ADD CONSTRAINT "MarketplaceListing_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationRule NotificationRule_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationRule"
    ADD CONSTRAINT "NotificationRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PriceAlert PriceAlert_cropId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PriceAlert"
    ADD CONSTRAINT "PriceAlert_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES public."Crop"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PriceAlert PriceAlert_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PriceAlert"
    ADD CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Refund Refund_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Report Report_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Report Report_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceBooking ResourceBooking_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceBooking"
    ADD CONSTRAINT "ResourceBooking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Resource Resource_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Sensor Sensor_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sensor"
    ADD CONSTRAINT "Sensor_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SoilReading SoilReading_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SoilReading"
    ADD CONSTRAINT "SoilReading_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SoilReading SoilReading_sensorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SoilReading"
    ADD CONSTRAINT "SoilReading_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES public."Sensor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SupportTicket SupportTicket_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SupportTicket"
    ADD CONSTRAINT "SupportTicket_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeatherReading WeatherReading_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WeatherReading"
    ADD CONSTRAINT "WeatherReading_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

