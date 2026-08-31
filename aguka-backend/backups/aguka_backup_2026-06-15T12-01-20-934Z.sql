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
-- Name: DeliveryChannel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryChannel" AS ENUM (
    'IN_APP',
    'SOCKET',
    'FCM',
    'SMS',
    'EMAIL'
);


ALTER TYPE public."DeliveryChannel" OWNER TO postgres;

--
-- Name: DeliveryStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DeliveryStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'FAILED'
);


ALTER TYPE public."DeliveryStatus" OWNER TO postgres;

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
-- Name: PostAudience; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PostAudience" AS ENUM (
    'GLOBAL',
    'DISTRICT',
    'COOPERATIVE',
    'ASSIGNED_FARMERS'
);


ALTER TYPE public."PostAudience" OWNER TO postgres;

--
-- Name: PostStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PostStatus" AS ENUM (
    'active',
    'hidden',
    'reported',
    'archived'
);


ALTER TYPE public."PostStatus" OWNER TO postgres;

--
-- Name: PostType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PostType" AS ENUM (
    'COMMUNITY_POST',
    'COMMUNITY_ADVISORY',
    'COMMUNITY_ALERT',
    'COMMUNITY_EMERGENCY'
);


ALTER TYPE public."PostType" OWNER TO postgres;

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
-- Name: AdvisoryTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AdvisoryTemplate" (
    id text NOT NULL,
    "officerId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    recommendation text,
    severity text DEFAULT 'info'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AdvisoryTemplate" OWNER TO postgres;

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
    "sentViaSms" boolean DEFAULT false NOT NULL,
    channel text DEFAULT 'app'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
-- Name: CooperativeExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CooperativeExpense" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    category text NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text NOT NULL,
    "receiptUrl" text,
    "recordedBy" text NOT NULL,
    "expenseDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CooperativeExpense" OWNER TO postgres;

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
    "rootDepthCm" integer DEFAULT 30,
    "cropCoefficient" numeric(4,2) DEFAULT 0.8,
    "isActive" boolean DEFAULT true NOT NULL,
    "deletedAt" timestamp(3) without time zone
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
-- Name: EventAttendee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EventAttendee" (
    id text NOT NULL,
    "activityId" text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "attendedAt" timestamp(3) without time zone
);


ALTER TABLE public."EventAttendee" OWNER TO postgres;

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
-- Name: FarmerFiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FarmerFiles" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FarmerFiles" OWNER TO postgres;

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
    province_code text,
    district_code text,
    sector_code text,
    cell_code text,
    village_code text,
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
    "deletedAt" timestamp(3) without time zone,
    "verificationStatus" text DEFAULT 'pending'::text NOT NULL,
    "verifiedBy" text,
    "verifiedAt" timestamp(3) without time zone
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
-- Name: FieldVisitNote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FieldVisitNote" (
    id text NOT NULL,
    "officerId" text NOT NULL,
    "farmerId" text NOT NULL,
    "visitDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text NOT NULL,
    "actionItems" text,
    "followUpDate" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FieldVisitNote" OWNER TO postgres;

--
-- Name: ForumComment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ForumComment" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "authorId" text NOT NULL,
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
    "authorId" text NOT NULL,
    "cooperativeId" text,
    title text,
    content text NOT NULL,
    category text,
    type public."PostType" DEFAULT 'COMMUNITY_POST'::public."PostType" NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "audienceType" public."PostAudience" DEFAULT 'GLOBAL'::public."PostAudience" NOT NULL,
    "audienceId" text,
    "imageUrls" text[],
    "videoUrls" text[],
    "attachmentUrls" text[],
    "likesCount" integer DEFAULT 0 NOT NULL,
    "commentsCount" integer DEFAULT 0 NOT NULL,
    "viewsCount" integer DEFAULT 0 NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isAnswered" boolean DEFAULT false NOT NULL,
    "isKnowledgeBase" boolean DEFAULT false NOT NULL,
    status public."PostStatus" DEFAULT 'active'::public."PostStatus" NOT NULL,
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
-- Name: Guide; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Guide" (
    id text NOT NULL,
    title text NOT NULL,
    crop text,
    category text NOT NULL,
    summary text NOT NULL,
    content text NOT NULL,
    "readingTime" integer DEFAULT 5 NOT NULL,
    "waterRequirement" text,
    "growthPeriod" text,
    "optimalTemp" text,
    "soilType" text,
    icon text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Guide" OWNER TO postgres;

--
-- Name: IrrigationLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."IrrigationLog" (
    id text NOT NULL,
    "scheduleId" text,
    "zoneId" text,
    "farmerId" text NOT NULL,
    action text,
    reason text,
    "triggeredBy" text,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "executedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" integer,
    "waterUsedLiters" numeric(10,2),
    "waterSource" public."WaterSource",
    "triggerSource" text,
    status text DEFAULT 'completed'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    "marketId" text NOT NULL,
    "marketName" text NOT NULL,
    district text NOT NULL,
    "priceRwfPerKg" numeric(10,2) NOT NULL,
    currency text DEFAULT 'RWF'::text NOT NULL,
    trend text DEFAULT 'stable'::text NOT NULL,
    "trendPercentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "recordedAt" timestamp(3) without time zone NOT NULL,
    source text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
-- Name: MemberDue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MemberDue" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    period text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "paidById" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MemberDue" OWNER TO postgres;

--
-- Name: MemberRequest; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MemberRequest" (
    id text NOT NULL,
    "cooperativeId" text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "requestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reviewedAt" timestamp(3) without time zone,
    "reviewedBy" text
);


ALTER TABLE public."MemberRequest" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'system'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    metadata jsonb,
    channel text DEFAULT 'app'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: NotificationDelivery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NotificationDelivery" (
    id text NOT NULL,
    "notificationId" text NOT NULL,
    channel public."DeliveryChannel" NOT NULL,
    status public."DeliveryStatus" DEFAULT 'PENDING'::public."DeliveryStatus" NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "failureReason" text
);


ALTER TABLE public."NotificationDelivery" OWNER TO postgres;

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
-- Name: PostLike; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostLike" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostLike" OWNER TO postgres;

--
-- Name: PostReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostReport" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostReport" OWNER TO postgres;

--
-- Name: PostView; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostView" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PostView" OWNER TO postgres;

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
-- Name: Recommendation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recommendation" (
    id text NOT NULL,
    "farmerId" text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    recommendation text NOT NULL,
    confidence text NOT NULL,
    priority integer NOT NULL,
    "actionRequired" boolean NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    details jsonb,
    "generatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone
);


ALTER TABLE public."Recommendation" OWNER TO postgres;

--
-- Name: RecommendationRule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RecommendationRule" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    conditions jsonb,
    priority integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RecommendationRule" OWNER TO postgres;

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
    "farmerId" text,
    "cooperativeId" text,
    "reportType" text NOT NULL,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    content jsonb NOT NULL,
    "pdfUrl" text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "generatedById" text
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
    "deliveryStatus" text DEFAULT 'pending'::text NOT NULL,
    "deliveryDate" timestamp(3) without time zone,
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
-- Name: Season; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Season" (
    id text NOT NULL,
    name text NOT NULL,
    "startMonth" integer NOT NULL,
    "endMonth" integer NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Season" OWNER TO postgres;

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
    "fullName" text,
    "avatarUrl" text,
    "passwordHash" text,
    role public."UserRole" DEFAULT 'farmer'::public."UserRole" NOT NULL,
    language public."Language" DEFAULT 'kinyarwanda'::public."Language" NOT NULL,
    status public."UserStatus" DEFAULT 'active'::public."UserStatus" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "subscriptionType" text DEFAULT 'free'::text,
    "subscriptionExpiresAt" timestamp(3) without time zone,
    "hasSensorAccess" boolean DEFAULT false NOT NULL,
    "serviceAccessExpiresAt" timestamp(3) without time zone,
    "hasMarketAccess" boolean DEFAULT false NOT NULL,
    "isOnboarded" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT true NOT NULL,
    "requiresPasswordChange" boolean DEFAULT false NOT NULL,
    province text,
    district text,
    sector text,
    cell text,
    village text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
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
-- Name: feature_flags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feature_flags (
    id text NOT NULL,
    key text NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    description text,
    updated_by text,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.feature_flags OWNER TO postgres;

--
-- Name: password_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_histories (
    id text NOT NULL,
    user_id text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_histories OWNER TO postgres;

--
-- Name: security_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_policies (
    id text NOT NULL,
    policy_type text NOT NULL,
    config jsonb NOT NULL,
    updated_by text,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.security_policies OWNER TO postgres;

--
-- Name: user_merge_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_merge_logs (
    id text NOT NULL,
    primary_user_id text NOT NULL,
    secondary_user_id text NOT NULL,
    merged_data jsonb NOT NULL,
    merged_by text NOT NULL,
    merged_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_merge_logs OWNER TO postgres;

--
-- Data for Name: AdvisoryTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AdvisoryTemplate" (id, "officerId", title, message, recommendation, severity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Alert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Alert" (id, "farmerId", "alertType", severity, title, message, recommendation, "isRead", "sentViaSms", channel, "createdAt", "createdById") FROM stdin;
bdbc8f53-95ff-4e70-83f7-162233a0423b	dcda2652-8201-461b-b66c-199d46559b1a	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.389	\N
1dd93a0c-58b9-4c52-9f65-4e31329f5618	dcda2652-8201-461b-b66c-199d46559b1a	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.389	\N
fa8bc2f6-a028-4ee5-81e6-d5903958ea7b	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.405	\N
a03a01b1-ae01-44d9-b354-ccba36166871	f5fd961a-6846-45f7-b13d-b795bff19cec	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.411	\N
7a030b41-e125-473e-b501-9f29d998785a	f5fd961a-6846-45f7-b13d-b795bff19cec	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.411	\N
ef96d067-f353-473b-8fe7-4bd81f9b422a	f5fd961a-6846-45f7-b13d-b795bff19cec	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	f	app	2026-06-15 11:25:26.411	\N
ea3ba66c-a8da-4067-ba67-cd855f967fa7	0af120c1-d4b7-4719-8102-1013b24681ff	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.417	\N
a30144e9-c0fe-497a-a996-647dffdc270c	be27e8d0-183f-4058-93e3-b0b35fd2852d	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.422	\N
63981442-cf52-4b26-860e-f4275e0d64be	92f6e962-1503-48d8-bd40-96d357dc6858	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.426	\N
e671ba04-6627-4c4e-81b8-52b470aae826	13ff9666-eff8-40ab-be5c-ab7566af2309	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.431	\N
e111265d-7eed-440f-9aba-35690fd522ba	11b8cdc7-10ad-4f98-b66a-430f0c630091	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.435	\N
19d38309-1d44-4267-9135-a2a75d11e835	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.439	\N
1e6275a0-6aba-45a9-88a4-b301c61774ac	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.445	\N
2aa322a7-144d-41b1-8bbd-90d14c233aad	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.445	\N
e234cb50-6fd5-43d9-b4e3-06e493efa70c	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	f	app	2026-06-15 11:25:26.445	\N
37fe49e8-15b0-4c75-9b25-184f57951662	673e0225-61d4-4f83-a74d-ceb8a4d1f604	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.452	\N
49dbe5a5-1d21-48ef-a4df-c3897614fb4b	673e0225-61d4-4f83-a74d-ceb8a4d1f604	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.452	\N
2ab18953-9c0c-4f05-a050-268270bebcd8	a8be5879-af12-4128-a465-fa04876a8be7	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.458	\N
26ff8e01-8b66-4fb7-8018-ee72d75ed8af	a92ddbdd-684c-4d9e-9a69-728ca3e61339	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.463	\N
48485a67-219c-4044-861b-7ed35604e1de	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.469	\N
eb1a7c63-41f3-4f78-83ba-0a3718de9c08	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.469	\N
95bf0b9a-6105-4c31-a802-93ea62039545	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	f	app	2026-06-15 11:25:26.469	\N
82281af5-661b-4f37-9a7d-09481d1e2633	958704ff-8558-48fc-98a2-4ef07e511d04	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.475	\N
d0f11665-e190-4a8e-9e44-b6cc9138101c	958704ff-8558-48fc-98a2-4ef07e511d04	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.475	\N
a02c7242-e6c2-4eba-9f69-9b5c38b91459	d201582e-aa22-4517-bd65-fce9435b6ef9	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.48	\N
f12ea513-9b4d-4950-860e-51df1cc5a169	9c040a91-bde6-43da-9292-1d690e3412fb	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.484	\N
a197e917-8e57-4465-bb34-1ef36f81cdd6	51b9775b-12f1-4b7f-84de-9277c32ae3e4	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.491	\N
bce0e435-37a0-48d9-952d-7bf4db030277	51b9775b-12f1-4b7f-84de-9277c32ae3e4	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.491	\N
883eaf99-adb4-4ed9-803b-17828698be65	51b9775b-12f1-4b7f-84de-9277c32ae3e4	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	f	app	2026-06-15 11:25:26.491	\N
61e694b0-99af-41c0-b04e-992174248b51	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.497	\N
7742977e-cc06-4c0b-9c48-efb9996a34c9	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.497	\N
d8f65efd-4b13-4596-ab19-7427195e4276	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	f	app	2026-06-15 11:25:26.497	\N
081b9abf-0e55-45db-8e8f-83b2b0c606c5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	f	app	2026-06-15 11:25:26.503	\N
93595f77-9e8a-4272-a3b3-fa717088cd0a	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	f	app	2026-06-15 11:25:26.503	\N
1085aeb8-886b-429b-b482-7fc4e4f021e9	dcda2652-8201-461b-b66c-199d46559b1a	pest	warning	hello	hello		f	f	app	2026-06-15 11:33:57.421	9c1b7161-64b4-436e-a08f-17ff9f0079e5
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
50016f0d-07d0-4489-9fe8-eeb82736171c	00d4daa4-ead1-413a-9e43-bc07423fef4b	LOGIN	AUTH	00d4daa4-ead1-413a-9e43-bc07423fef4b	null	\N	\N	\N	2026-06-15 11:26:02.504
51e4d3ca-c61e-4477-8fa2-ee296d86bfc3	9c1b7161-64b4-436e-a08f-17ff9f0079e5	LOGIN	AUTH	9c1b7161-64b4-436e-a08f-17ff9f0079e5	null	\N	\N	\N	2026-06-15 11:28:29.382
be47f172-e90a-4ade-ae4c-f56fad3d1c9b	1652bdd2-357d-4534-a032-fdfe7e656864	LOGIN	AUTH	1652bdd2-357d-4534-a032-fdfe7e656864	null	\N	\N	\N	2026-06-15 11:29:59.93
569d75b8-28ad-4a82-af98-e1ad20934be7	1652bdd2-357d-4534-a032-fdfe7e656864	UPDATE_PROFILE	USER_PROFILE	1652bdd2-357d-4534-a032-fdfe7e656864	{"id": "1652bdd2-357d-4534-a032-fdfe7e656864", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": {"id": "92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1", "cell": null, "sector": "Base", "village": null, "district": "Rulindo", "farmName": "Nyira Mixed Farm", "fullName": "Alice Nyirabashyitsi", "location": null, "gpsLatitude": "-1.74", "waterSource": "rainwater", "gpsLongitude": "29.973", "cooperativeId": "06dbba70-4e27-4ce4-9e10-aa07668bb0be", "familyMembers": 0, "irrigationType": "sprinkler", "emergencyContact": null, "farmSizeHectares": "1.3", "preferredChannel": "smartphone"}, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-06-15T11:25:25.308Z", "updatedAt": "2026-06-15T11:25:25.308Z", "cooperativeId": "06dbba70-4e27-4ce4-9e10-aa07668bb0be"}	{"id": "1652bdd2-357d-4534-a032-fdfe7e656864", "cell": null, "role": "farmer", "email": "alice.nyira@aguka.rw", "phone": "250788300020", "sector": null, "status": "active", "profile": {"id": "92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1", "cell": null, "sector": "Base", "village": null, "district": "Rulindo", "farmName": "Nyira Mixed Farm", "fullName": "Alice Nyirabashyitsi", "location": null, "gpsLatitude": "-1.74", "waterSource": "rainwater", "gpsLongitude": "29.973", "cooperativeId": "06dbba70-4e27-4ce4-9e10-aa07668bb0be", "familyMembers": 0, "irrigationType": "sprinkler", "emergencyContact": null, "farmSizeHectares": "1.3", "preferredChannel": "smartphone"}, "village": null, "district": null, "fullName": null, "isActive": true, "language": "kinyarwanda", "province": null, "avatarUrl": null, "createdAt": "2026-06-15T11:25:25.308Z", "updatedAt": "2026-06-15T11:31:42.703Z", "cooperativeId": "06dbba70-4e27-4ce4-9e10-aa07668bb0be"}	\N	\N	2026-06-15 11:31:42.747
b7e9e05d-c78c-4f3e-9c61-b4ac246cee15	9c1b7161-64b4-436e-a08f-17ff9f0079e5	CREATE_PEST_DISEASE_ALERT	PEST_DISEASE_MANAGEMENT	1085aeb8-886b-429b-b482-7fc4e4f021e9	null	{"id": "1085aeb8-886b-429b-b482-7fc4e4f021e9", "title": "hello", "isRead": false, "channel": "app", "message": "hello", "farmerId": "dcda2652-8201-461b-b66c-199d46559b1a", "severity": "warning", "alertType": "pest", "createdAt": "2026-06-15T11:33:57.421Z", "sentViaSms": false, "createdById": "9c1b7161-64b4-436e-a08f-17ff9f0079e5", "recommendation": ""}	\N	\N	2026-06-15 11:33:57.437
0c18eea4-67ad-48c0-b5d2-9408c423ae87	00d4daa4-ead1-413a-9e43-bc07423fef4b	UPDATE_PASSWORD_POLICY	SECURITY	password-policy	{"details": "Password policy updated"}	\N	\N	\N	2026-06-15 11:53:45.824
2bb8b009-5e42-43a4-821b-7839a2cdeefb	00d4daa4-ead1-413a-9e43-bc07423fef4b	UPDATE_PASSWORD_POLICY	SECURITY	password-policy	{"details": "Password policy updated"}	\N	\N	\N	2026-06-15 12:00:15.276
\.


--
-- Data for Name: Backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Backup" (id, name, type, status, "sizeBytes", "filePath", "createdBy", "createdAt", "completedAt", "restoredAt") FROM stdin;
2a5d1dd4-1de2-46c5-8a93-d7d47e03d55a	aguka_backup_2026-06-15T12-01-20-934Z.sql	MANUAL	IN_PROGRESS	\N	F:\\Aguka Smart Framing Kit\\aguka-backend\\backups\\aguka_backup_2026-06-15T12-01-20-934Z.sql	00d4daa4-ead1-413a-9e43-bc07423fef4b	2026-06-15 12:01:20.939	\N	\N
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
\.


--
-- Data for Name: Cooperative; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cooperative" (id, name, "registrationNumber", district, sector, "contactPhone", "contactEmail", description, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Abunzubumwe Cooperative	COOP/2024/001	Musanze	Kinigi	250788123001	kinigi.coop@gmail.com	Supporting potato and maize farmers in the Kinigi volcanic region.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	Duhingane Agricultural Coop	COOP/2024/003	Huye	Ngoma	250788123003	duhingane.huye@gmail.com	Bean and sorghum farming collective in the southern province.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
a7706967-97ef-415d-ada9-b25daf67d6e3	Iterambere Farmers Coop	COOP/2024/002	Rubavu	Gisenyi	250788123002	iterambere.rubavu@gmail.com	Coffee and banana cooperative serving western province farmers.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
06dbba70-4e27-4ce4-9e10-aa07668bb0be	Agakunze Horticulture Coop	COOP/2024/010	Rulindo	Base	250788123010	agakunze.rulindo@gmail.com	Vegetables, tomatoes and horticulture cooperative for urban markets.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
72431a99-048b-4ba0-9837-342412d6fd90	Intwari Agri Cooperative	COOP/2024/005	Kayonza	Kabarondo	250788123005	intwari.kayonza@gmail.com	Cassava and maize cooperative promoting food security in Eastern province.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	Tuzamurane Rice Cooperative	COOP/2024/004	Bugesera	Nyamata	250788123004	tuzamurane.bugesera@gmail.com	Specialised in irrigated rice farming in the Nyamata marshlands.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
661adf0b-e027-45e7-a0a4-37caee0cd036	Twisungane Banana Coop	COOP/2024/009	Ruhango	Kinazi	250788123009	twisungane.ruhango@gmail.com	Banana farming and juice processing cooperative.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
8f4e7d42-fa55-465a-b705-3b05d2a4eb00	Ubumwe Tea Cooperative	COOP/2024/006	Nyamasheke	Kagano	250788123006	ubumwe.tea@gmail.com	Tea cultivation and processing cooperative near Lake Kivu.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
0c2b620c-f8a0-4058-aebc-50e410fee038	Ejo Heza Wheat Coop	COOP/2024/007	Burera	Rwerere	250788123007	ejoheza.burera@gmail.com	Wheat and Irish potato cooperative operating in highland areas.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
804a741e-6880-4a87-ac14-51f6fc85c5e5	Amahoro Coffee Cooperative	COOP/2024/008	Nyamagabe	Gasaka	250788123008	amahoro.coffee@gmail.com	Specialty coffee cooperative exporting washed Arabica.	t	2026-06-15 11:25:24.504	2026-06-15 11:25:24.504	\N
\.


--
-- Data for Name: CooperativeActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeActivity" (id, "cooperativeId", title, description, "activityType", status, "scheduledAt", location, "expectedParticipants", "actualParticipants", "organizerId", "createdAt", "updatedAt") FROM stdin;
92d52524-762e-40f3-b42f-23aa972534a3	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Post-harvest Handling Training	\N	training	scheduled	2026-06-16 11:25:24.749	Musanze - Kinigi Coop Office	30	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
778e3c44-2223-4fca-888f-a0253339a5ab	a7706967-97ef-415d-ada9-b25daf67d6e3	Irrigation Best Practices Workshop	\N	training	scheduled	2026-06-17 11:25:24.749	Rubavu - Gisenyi Coop Office	35	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
8c811b96-64cd-410e-b9f3-6aa05ab36451	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	Market Linkage Forum	\N	meeting	scheduled	2026-06-18 11:25:24.749	Huye - Ngoma Coop Office	40	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
c7dd93a2-8fac-41dd-a3d5-4ece196a32fb	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	Soil Health Seminar	\N	training	scheduled	2026-06-19 11:25:24.75	Bugesera - Nyamata Coop Office	45	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
40e24168-0d50-422a-866f-339e9b8cd4ae	72431a99-048b-4ba0-9837-342412d6fd90	Pest & Disease Management	\N	training	scheduled	2026-06-20 11:25:24.75	Kayonza - Kabarondo Coop Office	50	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
baff545b-0743-4a2d-9b55-38738611014b	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	Financial Literacy for Farmers	\N	training	scheduled	2026-06-21 11:25:24.75	Nyamasheke - Kagano Coop Office	55	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
df490bba-1c24-483c-894c-34ab9a4f5920	0c2b620c-f8a0-4058-aebc-50e410fee038	Export Standards Training	\N	training	scheduled	2026-06-22 11:25:24.75	Burera - Rwerere Coop Office	60	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
50c2b9e9-6812-405e-bb19-80642b427bc8	804a741e-6880-4a87-ac14-51f6fc85c5e5	Cooperative Governance Meeting	\N	meeting	scheduled	2026-06-23 11:25:24.75	Nyamagabe - Gasaka Coop Office	65	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
482e1c8d-6f23-4688-9245-7899f9cbae4b	661adf0b-e027-45e7-a0a4-37caee0cd036	Agri-Input Subsidy Briefing	\N	meeting	scheduled	2026-06-24 11:25:24.75	Ruhango - Kinazi Coop Office	70	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
46b40e59-a9af-417a-92bc-e32465e61bc9	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Climate Smart Agriculture Session	\N	training	scheduled	2026-06-25 11:25:24.751	Rulindo - Base Coop Office	75	\N	\N	2026-06-15 11:25:24.76	2026-06-15 11:25:24.76
\.


--
-- Data for Name: CooperativeExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeExpense" (id, "cooperativeId", category, amount, description, "receiptUrl", "recordedBy", "expenseDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CooperativeMember; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeMember" (id, "userId", "cooperativeId", role, status, "joinedAt", "lastActivityAt") FROM stdin;
e7c06665-d868-453e-95be-c591ae235301	af45d49f-dc0c-4251-b84d-4b6e03577d7c	a7706967-97ef-415d-ada9-b25daf67d6e3	manager	active	2026-06-15 11:25:24.58	\N
7e929065-0e81-4bb9-a08a-7fa718a992e6	2a364931-6efb-45fe-a4af-484440f20fc9	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	manager	active	2026-06-15 11:25:24.561	\N
a364464b-9878-4a4e-967c-fb1f6404ec59	b0693c8a-162f-4393-8194-9e7a43713530	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	manager	active	2026-06-15 11:25:24.592	\N
e2f4623d-2932-43be-aa47-f99f3d6b6f1a	5c98983f-f01c-4c55-b478-0da7339f87b8	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	manager	active	2026-06-15 11:25:24.602	\N
2c20181d-d41d-475d-81b4-a03e9e2d5690	9b2f74f2-6b99-4799-acb6-786cdf46a9e7	72431a99-048b-4ba0-9837-342412d6fd90	manager	active	2026-06-15 11:25:24.603	\N
82acc5c8-8922-4cbf-96ae-bc1bc0f3db3c	79d7bc71-5b5f-4fe9-8acc-b90365a9c90d	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	manager	active	2026-06-15 11:25:24.608	\N
0abbea6f-d5bb-4093-abad-29f16181e117	ab3ee7e4-5912-4f65-ab2c-a327d54715c9	0c2b620c-f8a0-4058-aebc-50e410fee038	manager	active	2026-06-15 11:25:24.61	\N
9aa8bccb-94a4-4346-acea-f5c7d3da9c24	8b31026e-9d04-4272-b30e-b5acd6bec14b	804a741e-6880-4a87-ac14-51f6fc85c5e5	manager	active	2026-06-15 11:25:24.612	\N
5c7e879b-075d-42ec-a1dc-929fdc86fbdc	914fb936-6720-482b-a6ee-32c68588d281	661adf0b-e027-45e7-a0a4-37caee0cd036	manager	active	2026-06-15 11:25:24.615	\N
ef863f1b-f6f1-4a07-bae9-c668413081e0	d740ba34-c911-4f00-b594-a4792511bb1a	06dbba70-4e27-4ce4-9e10-aa07668bb0be	manager	active	2026-06-15 11:25:24.618	\N
2e6fa2f4-13b4-409c-b560-dd7cddf42b50	711fd94b-07c8-4123-b075-29b4ed37959b	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	member	active	2026-06-15 11:25:24.882	\N
a26fc107-dce1-4bda-900b-6904433fcfec	bd0fe305-7694-40d0-9820-5c05f3eff708	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	member	active	2026-06-15 11:25:24.906	\N
85446d6a-73ec-46f4-b906-7de986cb6cc0	e6bef470-5799-4d5a-a467-11611cc1ae70	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	member	active	2026-06-15 11:25:24.93	\N
b0e4018a-4e91-46a1-a289-a697d3c6c66f	f38a8e24-63a1-4792-80f5-e7f6fb83739d	a7706967-97ef-415d-ada9-b25daf67d6e3	member	active	2026-06-15 11:25:24.954	\N
2b98df2d-60e6-405c-a675-e01916038c5a	086bc791-7769-472e-8f9d-73fb3f0cc068	a7706967-97ef-415d-ada9-b25daf67d6e3	member	active	2026-06-15 11:25:24.979	\N
d786f7e1-6ebd-479d-b5a2-5c7bd06f6c8d	4e74f05d-7a6d-4765-864f-52a3d9e2037e	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	member	active	2026-06-15 11:25:25.004	\N
f7979e13-6051-473d-afe8-046bc04f7084	bb5b4e4f-6f25-466a-950d-dc6ac956487f	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	member	active	2026-06-15 11:25:25.026	\N
30b6aa4d-ed9a-421b-ae0b-b309c530fb24	30ec83c7-61ed-49a5-adf4-862764c51141	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	member	active	2026-06-15 11:25:25.046	\N
b0fc1064-8bb2-4aa4-aa99-c019a168603c	e8217a49-4634-4f68-a88c-7c16461ed779	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	member	active	2026-06-15 11:25:25.067	\N
a4fd8f2f-2e00-4a85-8abc-f48cf8e480cb	9dbf988e-40b2-480c-917f-5c05650f4ff7	72431a99-048b-4ba0-9837-342412d6fd90	member	active	2026-06-15 11:25:25.089	\N
e38fc219-7e3f-4639-a45d-22efa251ba4c	fadebf60-23da-4539-9bfa-f336b9b2415e	72431a99-048b-4ba0-9837-342412d6fd90	member	active	2026-06-15 11:25:25.109	\N
bf342816-109f-44fa-b8c8-4d9256fe52f4	5697322c-32dd-4c97-a349-da421a9cdcbd	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	member	active	2026-06-15 11:25:25.128	\N
c496da74-1655-446c-af77-3d85656cfb58	ecc1a97a-efb1-4a2e-bfea-1a761d114ca6	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	member	active	2026-06-15 11:25:25.157	\N
787f4dc6-7689-45d5-b2f0-6576fa7af5c8	fc016103-b504-4195-95dd-fba1c0f0f1bb	0c2b620c-f8a0-4058-aebc-50e410fee038	member	active	2026-06-15 11:25:25.183	\N
01e7b235-902f-4034-9b8f-b996b75f959c	e132efee-2135-4696-828b-0ff38c084fe7	804a741e-6880-4a87-ac14-51f6fc85c5e5	member	active	2026-06-15 11:25:25.205	\N
4e3105f3-5f4b-43d2-86ad-56a895d69294	edb9d045-a82d-4f20-b5e5-2a549128f323	804a741e-6880-4a87-ac14-51f6fc85c5e5	member	active	2026-06-15 11:25:25.228	\N
18967247-fe20-4a9e-9118-07a26d7d4936	3482b36c-b79c-4f23-b0c0-7fc3cd0358fa	661adf0b-e027-45e7-a0a4-37caee0cd036	member	active	2026-06-15 11:25:25.25	\N
bed29153-538e-480a-a947-0a94a486a2b5	a3469761-e403-43b9-b87c-a5a77a7f0a6d	06dbba70-4e27-4ce4-9e10-aa07668bb0be	member	active	2026-06-15 11:25:25.273	\N
34341042-6d74-408c-b54b-c901dcb2b186	2a9c84e6-30e0-4b25-b4b7-9f50f48d131b	06dbba70-4e27-4ce4-9e10-aa07668bb0be	member	active	2026-06-15 11:25:25.298	\N
19d473d6-cfeb-475d-bdb5-9bceb36870a8	1652bdd2-357d-4534-a032-fdfe7e656864	06dbba70-4e27-4ce4-9e10-aa07668bb0be	member	active	2026-06-15 11:25:25.32	\N
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

COPY public."Crop" (id, "nameEn", "nameRw", "nameFr", category, "growingPeriodDays", "waterRequirementMm", "nitrogenRequirementKgha", "phosphorusRequirementKgha", "potassiumRequirementKgha", "optimalPhMin", "optimalPhMax", "optimalTempMinCelsius", "optimalTempMaxCelsius", "imageUrl", "rootDepthCm", "cropCoefficient", "isActive", "deletedAt") FROM stdin;
maize	Maize	Ibigori	\N	Cereal	120	500.00	\N	\N	\N	5.80	7.00	\N	\N	\N	30	0.80	t	\N
coffee	Coffee	Ikawa	\N	Cash Crop	1095	800.00	\N	\N	\N	5.00	6.00	\N	\N	\N	30	0.80	t	\N
beans	Beans	Ibishyimbo	\N	Legume	75	300.00	\N	\N	\N	6.00	7.50	\N	\N	\N	30	0.80	t	\N
cassava	Cassava	Imyumbati	\N	Tuber	360	600.00	\N	\N	\N	4.50	7.00	\N	\N	\N	30	0.80	t	\N
tea	Tea	Icyayi	\N	Cash Crop	1460	1200.00	\N	\N	\N	4.50	5.50	\N	\N	\N	30	0.80	t	\N
sorghum	Sorghum	Amasaka	\N	Cereal	130	350.00	\N	\N	\N	5.50	7.50	\N	\N	\N	30	0.80	t	\N
wheat	Wheat	Ingano	\N	Cereal	110	450.00	\N	\N	\N	6.00	7.00	\N	\N	\N	30	0.80	t	\N
rice	Rice	Umuceri	\N	Cereal	150	1200.00	\N	\N	\N	5.00	6.50	\N	\N	\N	30	0.80	t	\N
banana	Banana	Igitoki	\N	Fruit	365	1000.00	\N	\N	\N	5.50	6.50	\N	\N	\N	30	0.80	t	\N
potato	Potato	Ibirayi	\N	Tuber	90	400.00	\N	\N	\N	5.00	6.50	\N	\N	\N	30	0.80	t	\N
\.


--
-- Data for Name: Device; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Device" (id, "userId", "fcmToken", platform, "lastUsedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: EventAttendee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EventAttendee" (id, "activityId", "userId", status, "attendedAt") FROM stdin;
\.


--
-- Data for Name: ExtensionOfficerAssignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExtensionOfficerAssignment" (id, "extensionOfficerId", "farmerId", "assignedAt") FROM stdin;
8177aae7-d1b0-4f34-8bf1-01cf39707e01	9c1b7161-64b4-436e-a08f-17ff9f0079e5	711fd94b-07c8-4123-b075-29b4ed37959b	2026-06-15 11:25:25.341
98807046-7fad-48d7-aec5-33218e748a8b	9c1b7161-64b4-436e-a08f-17ff9f0079e5	bd0fe305-7694-40d0-9820-5c05f3eff708	2026-06-15 11:25:25.341
2d607330-3353-4582-90a2-3341e0b1f9ab	9c1b7161-64b4-436e-a08f-17ff9f0079e5	e6bef470-5799-4d5a-a467-11611cc1ae70	2026-06-15 11:25:25.341
fc97db03-6afc-467a-a5ef-5bfb3ebc26eb	9c1b7161-64b4-436e-a08f-17ff9f0079e5	f38a8e24-63a1-4792-80f5-e7f6fb83739d	2026-06-15 11:25:25.341
53c7abb5-b099-4440-856a-850a15860637	9c1b7161-64b4-436e-a08f-17ff9f0079e5	086bc791-7769-472e-8f9d-73fb3f0cc068	2026-06-15 11:25:25.341
88ea6674-0054-4773-af32-19ca46c5d2ff	9c1b7161-64b4-436e-a08f-17ff9f0079e5	4e74f05d-7a6d-4765-864f-52a3d9e2037e	2026-06-15 11:25:25.341
c203ece7-a736-4203-90dc-f938d1608528	9c1b7161-64b4-436e-a08f-17ff9f0079e5	bb5b4e4f-6f25-466a-950d-dc6ac956487f	2026-06-15 11:25:25.341
e57dface-e34d-4cbd-baaa-6db35ac43b1c	9c1b7161-64b4-436e-a08f-17ff9f0079e5	30ec83c7-61ed-49a5-adf4-862764c51141	2026-06-15 11:25:25.341
96c66488-cb8b-4274-a681-705754c51928	9c1b7161-64b4-436e-a08f-17ff9f0079e5	e8217a49-4634-4f68-a88c-7c16461ed779	2026-06-15 11:25:25.341
3d230c64-386e-4a74-8c32-276180c9c3eb	9c1b7161-64b4-436e-a08f-17ff9f0079e5	9dbf988e-40b2-480c-917f-5c05650f4ff7	2026-06-15 11:25:25.341
a0f08c9f-7d11-489b-a665-16b8083e2af9	f08c3799-76cf-47ff-a789-991e34f9d86d	fadebf60-23da-4539-9bfa-f336b9b2415e	2026-06-15 11:25:25.341
a2308e13-5c2b-4163-adea-f6b70ce9c40d	f08c3799-76cf-47ff-a789-991e34f9d86d	5697322c-32dd-4c97-a349-da421a9cdcbd	2026-06-15 11:25:25.341
2939f6ae-7af9-4d35-877e-bc28ce8b0de9	f08c3799-76cf-47ff-a789-991e34f9d86d	ecc1a97a-efb1-4a2e-bfea-1a761d114ca6	2026-06-15 11:25:25.341
fe274464-2549-40c1-8e67-2ce0f167e045	f08c3799-76cf-47ff-a789-991e34f9d86d	fc016103-b504-4195-95dd-fba1c0f0f1bb	2026-06-15 11:25:25.341
edc9c2ed-9c13-4bda-8b09-b1b6f3ac9875	f08c3799-76cf-47ff-a789-991e34f9d86d	e132efee-2135-4696-828b-0ff38c084fe7	2026-06-15 11:25:25.341
b7d026ce-aceb-42cd-adfc-8ce792518cc6	f08c3799-76cf-47ff-a789-991e34f9d86d	edb9d045-a82d-4f20-b5e5-2a549128f323	2026-06-15 11:25:25.341
1b68eced-8d14-4fad-b3b4-5d20f81ef5ce	f08c3799-76cf-47ff-a789-991e34f9d86d	3482b36c-b79c-4f23-b0c0-7fc3cd0358fa	2026-06-15 11:25:25.341
33ff2966-aaf7-4970-9c8d-d414c340bb91	f08c3799-76cf-47ff-a789-991e34f9d86d	a3469761-e403-43b9-b87c-a5a77a7f0a6d	2026-06-15 11:25:25.341
306fb526-d9d5-4059-9689-e8882db90b23	f08c3799-76cf-47ff-a789-991e34f9d86d	2a9c84e6-30e0-4b25-b4b7-9f50f48d131b	2026-06-15 11:25:25.341
996f5a8d-3727-40f8-bbc6-ad331982c0d6	f08c3799-76cf-47ff-a789-991e34f9d86d	1652bdd2-357d-4534-a032-fdfe7e656864	2026-06-15 11:25:25.341
\.


--
-- Data for Name: ExtensionOfficerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExtensionOfficerProfile" (id, "userId", "employeeId", organization, "badgePhotoUrl", specializations, "coveredSectors", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1351b8f6-eac4-4c39-9456-21cb6adc8228	9c1b7161-64b4-436e-a08f-17ff9f0079e5	OFF-001	Aguka Extension Services	\N	{"Soil health",Irrigation,"Pest management"}	{Kinigi,Gisenyi,Ngoma,Nyamata,Kabarondo}	2026-06-15 11:25:23.594	2026-06-15 11:25:23.594	\N
24faaeda-8f65-42d1-832e-33f6f9f1a47c	f08c3799-76cf-47ff-a789-991e34f9d86d	OFF-002	Aguka Extension Services	\N	{Coffee,Tea,"Climate smart agriculture"}	{Kagano,Rwerere,Gasaka,Kinazi,Base}	2026-06-15 11:25:23.632	2026-06-15 11:25:23.632	\N
\.


--
-- Data for Name: FarmActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmActivity" (id, "farmerId", "activityType", category, "cropId", quantity, unit, "costRwf", notes, "activityDate", "createdAt") FROM stdin;
ffa683e2-3058-465e-ae50-a22dada027a9	dcda2652-8201-461b-b66c-199d46559b1a	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.213	2026-06-15 11:25:26.219
72f10742-cd8e-478f-8f53-7b2b84d0478d	dcda2652-8201-461b-b66c-199d46559b1a	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.214	2026-06-15 11:25:26.219
fda63885-55df-4be6-aeb9-1f13f93f4fe9	dcda2652-8201-461b-b66c-199d46559b1a	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.214	2026-06-15 11:25:26.219
819b631e-d86b-4408-9dae-13fdcab28d5f	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.234	2026-06-15 11:25:26.238
5dc78a0e-0140-40f7-a452-b10d9ae50f48	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.234	2026-06-15 11:25:26.238
f98db880-93e2-4dfb-81e1-7b1b39b5784e	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.234	2026-06-15 11:25:26.238
d6d1d698-feb3-41ba-80e8-deccf75b6763	f5fd961a-6846-45f7-b13d-b795bff19cec	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.242	2026-06-15 11:25:26.247
dc8eec74-b82b-4302-8ed0-4e7e13492938	f5fd961a-6846-45f7-b13d-b795bff19cec	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.243	2026-06-15 11:25:26.247
8e99d92d-d6de-48aa-8645-cf8386c62a9c	f5fd961a-6846-45f7-b13d-b795bff19cec	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.243	2026-06-15 11:25:26.247
6933ef1c-2f52-4723-880f-86006af468d3	0af120c1-d4b7-4719-8102-1013b24681ff	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.25	2026-06-15 11:25:26.254
2ad06e9b-575a-4127-9285-97f1b9c909aa	0af120c1-d4b7-4719-8102-1013b24681ff	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.25	2026-06-15 11:25:26.254
382cfae9-c5cf-42a5-9e4f-7dbcd8d6bf12	0af120c1-d4b7-4719-8102-1013b24681ff	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.25	2026-06-15 11:25:26.254
301d07b7-41a5-4dc2-b533-4fb906172d0f	be27e8d0-183f-4058-93e3-b0b35fd2852d	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.258	2026-06-15 11:25:26.262
7c11bc93-c8d7-4a22-b58e-146831ab774c	be27e8d0-183f-4058-93e3-b0b35fd2852d	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.258	2026-06-15 11:25:26.262
bbeab427-e6e0-411e-93b1-073b43b2359a	be27e8d0-183f-4058-93e3-b0b35fd2852d	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.258	2026-06-15 11:25:26.262
56790da6-8057-4905-bc93-5700018d887e	92f6e962-1503-48d8-bd40-96d357dc6858	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.265	2026-06-15 11:25:26.269
87c05288-b69a-417d-8afb-6745af1bc5cb	92f6e962-1503-48d8-bd40-96d357dc6858	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.265	2026-06-15 11:25:26.269
3862436c-4c0b-411a-99d1-5d5eae16cf23	92f6e962-1503-48d8-bd40-96d357dc6858	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.265	2026-06-15 11:25:26.269
c1fad0b9-c591-42ad-b738-667da4312678	13ff9666-eff8-40ab-be5c-ab7566af2309	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.272	2026-06-15 11:25:26.276
c5297316-78cc-43f5-974e-55735e05e4de	13ff9666-eff8-40ab-be5c-ab7566af2309	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.272	2026-06-15 11:25:26.276
76ccf911-1823-455d-b8f8-01bee211dd77	13ff9666-eff8-40ab-be5c-ab7566af2309	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.272	2026-06-15 11:25:26.276
7003f4a2-f1e8-4afa-8a83-fecf39406fc1	11b8cdc7-10ad-4f98-b66a-430f0c630091	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.293	2026-06-15 11:25:26.296
fe33eca2-763c-4a4a-9c3d-27f75c8685a0	11b8cdc7-10ad-4f98-b66a-430f0c630091	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.293	2026-06-15 11:25:26.296
1ea39bc2-ca4a-497a-bb05-11e7e2d445e1	11b8cdc7-10ad-4f98-b66a-430f0c630091	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.293	2026-06-15 11:25:26.296
228fa421-5949-4e69-b324-86dc49bd0170	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.299	2026-06-15 11:25:26.303
776b1e00-cc9c-4cdd-827a-3a7c45df5e37	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.299	2026-06-15 11:25:26.303
725f6e20-8e97-44b4-93b9-5ca1eeb71527	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.299	2026-06-15 11:25:26.303
91131b0c-5899-4e68-9552-5dd122273cb0	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.306	2026-06-15 11:25:26.309
dcd19026-4ffe-4878-9796-50ba9494f1f7	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.306	2026-06-15 11:25:26.309
a5bcf508-0299-4681-9065-dbdc1d864c18	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.306	2026-06-15 11:25:26.309
3b9d176a-f392-4df1-96d6-ebf47bd9f3c8	673e0225-61d4-4f83-a74d-ceb8a4d1f604	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.312	2026-06-15 11:25:26.316
fb1e98cd-dfb4-403e-ae92-c0635d3a8f20	673e0225-61d4-4f83-a74d-ceb8a4d1f604	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.312	2026-06-15 11:25:26.316
25cdb289-f118-4755-a5e8-a5dee5bcc279	673e0225-61d4-4f83-a74d-ceb8a4d1f604	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.312	2026-06-15 11:25:26.316
27ed9a33-0825-4fa1-8ab2-9d157482880e	a8be5879-af12-4128-a465-fa04876a8be7	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.319	2026-06-15 11:25:26.322
8fbe8cfb-ccbd-4bd1-ba09-af93b664a6ec	a8be5879-af12-4128-a465-fa04876a8be7	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.319	2026-06-15 11:25:26.322
8735e238-aefd-4cc5-907b-2ee967d6a5a2	a8be5879-af12-4128-a465-fa04876a8be7	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.319	2026-06-15 11:25:26.322
88db03a3-330a-4eb0-9304-57e3fd8b82bd	a92ddbdd-684c-4d9e-9a69-728ca3e61339	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.326	2026-06-15 11:25:26.33
51c68f43-842d-4641-88ff-2fb83a8b643d	a92ddbdd-684c-4d9e-9a69-728ca3e61339	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.326	2026-06-15 11:25:26.33
670ab88e-9b79-4aba-abf8-d1cf5a7b3485	a92ddbdd-684c-4d9e-9a69-728ca3e61339	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.326	2026-06-15 11:25:26.33
7f41d5ea-aa3e-46eb-b6cf-de545c37b5b3	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.334	2026-06-15 11:25:26.338
25d641f1-b258-4ad9-a7dd-a3f0b6e9cb53	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.334	2026-06-15 11:25:26.338
314f72b8-623d-4119-a204-082b9624d186	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.334	2026-06-15 11:25:26.338
cef4d517-56ba-4cb4-a759-783d47624156	958704ff-8558-48fc-98a2-4ef07e511d04	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.342	2026-06-15 11:25:26.345
29f44745-990a-4a65-893e-a1831828dc36	958704ff-8558-48fc-98a2-4ef07e511d04	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.342	2026-06-15 11:25:26.345
4e624978-63c6-4631-979f-24581f3c703f	958704ff-8558-48fc-98a2-4ef07e511d04	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.342	2026-06-15 11:25:26.345
b2eb3212-af38-41ae-b15a-10b413ab89b3	d201582e-aa22-4517-bd65-fce9435b6ef9	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.349	2026-06-15 11:25:26.353
8a7454e2-714e-4b2a-95ec-efbceab7acbf	d201582e-aa22-4517-bd65-fce9435b6ef9	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.349	2026-06-15 11:25:26.353
a1a363cc-625d-40fb-a3cb-153c6837533c	d201582e-aa22-4517-bd65-fce9435b6ef9	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.349	2026-06-15 11:25:26.353
ce72ad97-4c5a-4c7b-9f4a-d7c6793b5f2d	9c040a91-bde6-43da-9292-1d690e3412fb	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.361	2026-06-15 11:25:26.365
09a59811-80e5-4996-af11-542c60ebbeba	9c040a91-bde6-43da-9292-1d690e3412fb	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.361	2026-06-15 11:25:26.365
6c6fa45b-ee24-4673-ac4c-3178dc2faa9a	9c040a91-bde6-43da-9292-1d690e3412fb	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.361	2026-06-15 11:25:26.365
45cc2fc4-8f65-4120-b6ad-d86d042522ef	51b9775b-12f1-4b7f-84de-9277c32ae3e4	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.367	2026-06-15 11:25:26.371
17cce16d-eb80-4fa0-bf3e-6f7862a63a20	51b9775b-12f1-4b7f-84de-9277c32ae3e4	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.367	2026-06-15 11:25:26.371
52af2f6d-4768-4335-8091-eaad57c7e47f	51b9775b-12f1-4b7f-84de-9277c32ae3e4	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.367	2026-06-15 11:25:26.371
d2696dbf-699c-46bf-9952-1d1939d00529	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.373	2026-06-15 11:25:26.377
fcb00dc0-6401-4b82-8a92-926cb80bab2b	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.373	2026-06-15 11:25:26.377
f7d26ff9-6135-473c-a7eb-738f39949388	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.373	2026-06-15 11:25:26.377
2111fc5e-4d6e-454c-9d7f-5dfec848ca0c	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-16 11:25:26.379	2026-06-15 11:25:26.383
d4f1b65f-b495-4792-942f-e9e55ff1bea0	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-01 11:25:26.379	2026-06-15 11:25:26.383
6bcc8c9f-f36f-4c89-8fd1-d132f4b2f842	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-16 11:25:26.379	2026-06-15 11:25:26.383
\.


--
-- Data for Name: FarmerCrop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerCrop" (id, "farmerId", "cropId", "plantedDate", "expectedHarvestDate", "actualHarvestDate", "plotSizeHectares", status, "estimatedYieldKg", "actualYieldKg", notes, "createdAt", "updatedAt") FROM stdin;
f702da6c-8d9a-4edd-b5ca-d4c74a524087	dcda2652-8201-461b-b66c-199d46559b1a	maize	2026-03-23 09:44:56.353	\N	\N	1.30	growing	\N	\N	\N	2026-06-15 11:25:25.365	2026-06-15 11:25:25.365
3ec82abb-e785-4a3a-9f55-32936c7e2b18	dcda2652-8201-461b-b66c-199d46559b1a	potato	2026-06-07 05:40:31.856	\N	\N	1.30	growing	\N	\N	\N	2026-06-15 11:25:25.385	2026-06-15 11:25:25.385
d80ce226-3e98-4e20-a987-9b6ae2f86aa7	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	potato	2026-05-15 06:44:43.98	\N	\N	0.90	growing	\N	\N	\N	2026-06-15 11:25:25.391	2026-06-15 11:25:25.391
d3a6f53f-e2b3-423e-94ec-11a8f773d9dd	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	beans	2026-03-26 12:07:43.941	\N	\N	0.90	growing	\N	\N	\N	2026-06-15 11:25:25.396	2026-06-15 11:25:25.396
9afa1e29-5242-490d-b349-716000569780	f5fd961a-6846-45f7-b13d-b795bff19cec	maize	2026-03-18 06:04:43.31	\N	\N	1.50	growing	\N	\N	\N	2026-06-15 11:25:25.402	2026-06-15 11:25:25.402
9020d23a-7402-48e2-989d-6b8dc2b39202	f5fd961a-6846-45f7-b13d-b795bff19cec	wheat	2026-03-25 01:19:19.399	\N	\N	1.50	growing	\N	\N	\N	2026-06-15 11:25:25.407	2026-06-15 11:25:25.407
d51b2924-a229-4484-80af-52e24cb8ebd3	0af120c1-d4b7-4719-8102-1013b24681ff	coffee	2026-05-31 19:48:51.786	\N	\N	0.80	growing	\N	\N	\N	2026-06-15 11:25:25.413	2026-06-15 11:25:25.413
942a5e9c-f950-441f-8df1-7718b5fcb6a7	0af120c1-d4b7-4719-8102-1013b24681ff	banana	2026-05-12 11:40:30.186	\N	\N	0.80	growing	\N	\N	\N	2026-06-15 11:25:25.417	2026-06-15 11:25:25.417
3a439d9c-0cf5-4daf-ad7e-ac3b6588e249	be27e8d0-183f-4058-93e3-b0b35fd2852d	coffee	2026-04-12 21:39:10.624	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.423	2026-06-15 11:25:25.423
c2fc2f62-25f1-4a40-a7a2-c1f7393f375b	be27e8d0-183f-4058-93e3-b0b35fd2852d	beans	2026-04-14 10:24:54.899	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.427	2026-06-15 11:25:25.427
b0f2aa3f-06ce-4563-bf16-608e51207367	92f6e962-1503-48d8-bd40-96d357dc6858	beans	2026-05-08 00:50:12.348	\N	\N	0.60	growing	\N	\N	\N	2026-06-15 11:25:25.433	2026-06-15 11:25:25.433
e9c4273d-0818-4001-8fbb-ca23ad455759	92f6e962-1503-48d8-bd40-96d357dc6858	sorghum	2026-06-09 16:38:40.459	\N	\N	0.60	growing	\N	\N	\N	2026-06-15 11:25:25.437	2026-06-15 11:25:25.437
9afe61c0-77fc-4367-b9d8-5fc86712e2e0	13ff9666-eff8-40ab-be5c-ab7566af2309	beans	2026-04-10 05:32:18.684	\N	\N	1.00	growing	\N	\N	\N	2026-06-15 11:25:25.443	2026-06-15 11:25:25.443
afbaa79d-5815-4ea9-83d7-13c18652ca56	13ff9666-eff8-40ab-be5c-ab7566af2309	maize	2026-04-26 18:20:33.768	\N	\N	1.00	growing	\N	\N	\N	2026-06-15 11:25:25.447	2026-06-15 11:25:25.447
22035f67-3c15-4c07-b186-608402f57594	11b8cdc7-10ad-4f98-b66a-430f0c630091	rice	2026-06-06 17:34:23.971	\N	\N	1.80	growing	\N	\N	\N	2026-06-15 11:25:25.452	2026-06-15 11:25:25.452
fc040c4f-5a23-4372-a2cc-2f21ef258a86	11b8cdc7-10ad-4f98-b66a-430f0c630091	beans	2026-05-10 23:27:26.776	\N	\N	1.80	growing	\N	\N	\N	2026-06-15 11:25:25.456	2026-06-15 11:25:25.456
3be49b96-5137-4d9e-91fc-9694b751d731	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	rice	2026-05-16 20:24:40.941	\N	\N	4.00	growing	\N	\N	\N	2026-06-15 11:25:25.461	2026-06-15 11:25:25.461
ae0e4dcd-2cfd-46db-b57e-b9a12df744c5	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	cassava	2026-03-29 10:25:52.922	\N	\N	1.40	growing	\N	\N	\N	2026-06-15 11:25:25.466	2026-06-15 11:25:25.466
c104cb5f-0018-4e6d-a2f8-de151b84d8ce	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	maize	2026-06-07 15:04:29.386	\N	\N	1.40	growing	\N	\N	\N	2026-06-15 11:25:25.47	2026-06-15 11:25:25.47
758d79fb-2561-474e-a703-19e2532eacef	673e0225-61d4-4f83-a74d-ceb8a4d1f604	cassava	2026-04-12 05:58:15.802	\N	\N	0.80	growing	\N	\N	\N	2026-06-15 11:25:25.474	2026-06-15 11:25:25.474
56dd9527-2893-48b4-8a94-75f2a09e3300	673e0225-61d4-4f83-a74d-ceb8a4d1f604	beans	2026-05-01 05:56:33.845	\N	\N	0.80	growing	\N	\N	\N	2026-06-15 11:25:25.477	2026-06-15 11:25:25.477
4d42c8b2-4a06-4755-bff5-a4b6b66cab77	a8be5879-af12-4128-a465-fa04876a8be7	tea	2026-06-11 14:26:57.193	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.48	2026-06-15 11:25:25.48
3c1dabb4-dab0-4a87-81f1-6406165d8f66	a8be5879-af12-4128-a465-fa04876a8be7	coffee	2026-03-28 00:25:59.817	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.484	2026-06-15 11:25:25.484
5cb21d06-b0a4-443a-8623-846b874e0c5f	a92ddbdd-684c-4d9e-9a69-728ca3e61339	tea	2026-04-05 20:07:27.399	\N	\N	0.90	growing	\N	\N	\N	2026-06-15 11:25:25.487	2026-06-15 11:25:25.487
de8a8f38-c778-485c-be74-44acee2b3653	a92ddbdd-684c-4d9e-9a69-728ca3e61339	banana	2026-04-23 05:26:16.466	\N	\N	0.90	growing	\N	\N	\N	2026-06-15 11:25:25.491	2026-06-15 11:25:25.491
852bcdd0-8723-4924-b8a4-06beb2dd730f	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	wheat	2026-04-08 15:05:26.267	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.494	2026-06-15 11:25:25.494
385d9159-67f9-42b4-a6c1-cae6ca4d3765	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	potato	2026-05-03 04:21:39.888	\N	\N	1.10	growing	\N	\N	\N	2026-06-15 11:25:25.498	2026-06-15 11:25:25.498
73a18bae-d02e-4adc-b96c-52ced2b8c784	958704ff-8558-48fc-98a2-4ef07e511d04	coffee	2026-04-16 16:53:09.589	\N	\N	3.20	growing	\N	\N	\N	2026-06-15 11:25:25.503	2026-06-15 11:25:25.503
7b770847-a3cd-4ed3-a0dc-df07f2a2a549	d201582e-aa22-4517-bd65-fce9435b6ef9	coffee	2026-06-12 22:01:34.879	\N	\N	1.40	growing	\N	\N	\N	2026-06-15 11:25:25.506	2026-06-15 11:25:25.506
9e0489b0-e3ef-453a-b0e6-c2749909caae	d201582e-aa22-4517-bd65-fce9435b6ef9	beans	2026-05-13 03:39:45.647	\N	\N	1.40	growing	\N	\N	\N	2026-06-15 11:25:25.511	2026-06-15 11:25:25.511
c7ea84d7-ddcf-4143-be3d-2f0fecb1e35f	9c040a91-bde6-43da-9292-1d690e3412fb	banana	2026-04-03 10:03:59.974	\N	\N	0.70	growing	\N	\N	\N	2026-06-15 11:25:25.516	2026-06-15 11:25:25.516
61f93b53-7fac-4647-bc4c-f547af33370d	9c040a91-bde6-43da-9292-1d690e3412fb	maize	2026-04-16 10:45:43.287	\N	\N	0.70	growing	\N	\N	\N	2026-06-15 11:25:25.52	2026-06-15 11:25:25.52
52c2ebd8-b01b-42e8-996a-c26ba0f4b46b	51b9775b-12f1-4b7f-84de-9277c32ae3e4	beans	2026-06-08 05:40:12.517	\N	\N	0.60	growing	\N	\N	\N	2026-06-15 11:25:25.523	2026-06-15 11:25:25.523
ece9d1fa-a005-483b-9199-8485b48bbe0a	51b9775b-12f1-4b7f-84de-9277c32ae3e4	wheat	2026-05-13 06:30:39.89	\N	\N	0.60	growing	\N	\N	\N	2026-06-15 11:25:25.527	2026-06-15 11:25:25.527
6d7d473c-e803-41c1-90cd-e87c4aedbf6c	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	maize	2026-06-08 11:55:36.776	\N	\N	0.50	growing	\N	\N	\N	2026-06-15 11:25:25.534	2026-06-15 11:25:25.534
65337f82-9d13-40ab-942e-8b7acab7055d	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	cassava	2026-06-05 01:10:43.422	\N	\N	0.50	growing	\N	\N	\N	2026-06-15 11:25:25.537	2026-06-15 11:25:25.537
b5082695-77aa-4dfc-b879-a786c33e5abf	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	beans	2026-05-16 02:43:05.861	\N	\N	0.70	growing	\N	\N	\N	2026-06-15 11:25:25.54	2026-06-15 11:25:25.54
28d037c8-8d9e-4211-a33c-1a376555cd99	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	banana	2026-05-05 03:28:10.22	\N	\N	0.70	growing	\N	\N	\N	2026-06-15 11:25:25.543	2026-06-15 11:25:25.543
17fa888a-7cd0-473d-9590-ee9805d802b8	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	maize	2026-06-15 11:31:42.455	\N	\N	\N	growing	\N	\N	\N	2026-06-15 11:31:42.487	2026-06-15 11:31:42.487
\.


--
-- Data for Name: FarmerFiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerFiles" (id, "farmerId", "fileType", "filePath", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: FarmerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerProfile" (id, "userId", "cooperativeId", "fullName", "farmName", location, district, sector, cell, village, province_code, district_code, sector_code, cell_code, village_code, "farmSizeHectares", "gpsLatitude", "gpsLongitude", "elevationMeters", "soilType", "waterSource", "irrigationType", "preferredChannel", "literacyLevel", "profileImageUrl", "emergencyContact", "familyMembers", "createdAt", "updatedAt", "deletedAt", "verificationStatus", "verifiedBy", "verifiedAt") FROM stdin;
dcda2652-8201-461b-b66c-199d46559b1a	711fd94b-07c8-4123-b075-29b4ed37959b	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Jean Damascene Habimana	Habimana Family Farm	\N	Musanze	Kinigi	\N	\N	\N	\N	\N	\N	\N	2.50	-1.43330000	29.63330000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.854	2026-06-15 11:25:24.854	\N	pending	\N	\N
e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	bd0fe305-7694-40d0-9820-5c05f3eff708	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Solange Uwimana	Uwimana Green Farm	\N	Musanze	Kinigi	\N	\N	\N	\N	\N	\N	\N	1.80	-1.44100000	29.62000000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.895	2026-06-15 11:25:24.895	\N	pending	\N	\N
f5fd961a-6846-45f7-b13d-b795bff19cec	e6bef470-5799-4d5a-a467-11611cc1ae70	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Célestin Bizimana	Bizimana Hillside Farm	\N	Musanze	Kinigi	\N	\N	\N	\N	\N	\N	\N	3.00	-1.42900000	29.64000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.919	2026-06-15 11:25:24.919	\N	pending	\N	\N
0af120c1-d4b7-4719-8102-1013b24681ff	f38a8e24-63a1-4792-80f5-e7f6fb83739d	a7706967-97ef-415d-ada9-b25daf67d6e3	Claudine Mukandayisenga	Mukand Riverside Farm	\N	Rubavu	Gisenyi	\N	\N	\N	\N	\N	\N	\N	1.50	-1.68330000	29.26670000	\N	Sandy Loam	river	flood	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.941	2026-06-15 11:25:24.941	\N	pending	\N	\N
be27e8d0-183f-4058-93e3-b0b35fd2852d	086bc791-7769-472e-8f9d-73fb3f0cc068	a7706967-97ef-415d-ada9-b25daf67d6e3	Théophile Ntungwanayo	Ntu Lake Farm	\N	Rubavu	Gisenyi	\N	\N	\N	\N	\N	\N	\N	2.20	-1.67500000	29.28000000	\N	Loamy	well	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.967	2026-06-15 11:25:24.967	\N	pending	\N	\N
92f6e962-1503-48d8-bd40-96d357dc6858	4e74f05d-7a6d-4765-864f-52a3d9e2037e	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	Immaculée Uwera	Uwera Southern Farm	\N	Huye	Ngoma	\N	\N	\N	\N	\N	\N	\N	1.20	-2.59900000	29.73900000	\N	Clay	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:24.991	2026-06-15 11:25:24.991	\N	pending	\N	\N
13ff9666-eff8-40ab-be5c-ab7566af2309	bb5b4e4f-6f25-466a-950d-dc6ac956487f	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	Évariste Nzigiyimana	Nzigi Valley Farm	\N	Huye	Ngoma	\N	\N	\N	\N	\N	\N	\N	2.00	-2.60500000	29.74500000	\N	Sandy	well	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.015	2026-06-15 11:25:25.015	\N	pending	\N	\N
11b8cdc7-10ad-4f98-b66a-430f0c630091	30ec83c7-61ed-49a5-adf4-862764c51141	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	Vestine Nkusi	Nkusi Marshland Farm	\N	Bugesera	Nyamata	\N	\N	\N	\N	\N	\N	\N	3.50	-2.15300000	30.05200000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.036	2026-06-15 11:25:25.036	\N	pending	\N	\N
cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	e8217a49-4634-4f68-a88c-7c16461ed779	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	Patrice Mugabo	Mugabo Rice Fields	\N	Bugesera	Nyamata	\N	\N	\N	\N	\N	\N	\N	4.00	-2.16100000	30.06000000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.058	2026-06-15 11:25:25.058	\N	pending	\N	\N
8d529770-72ac-46c1-a2ad-6e9ad01c6e27	9dbf988e-40b2-480c-917f-5c05650f4ff7	72431a99-048b-4ba0-9837-342412d6fd90	Domitille Uwimana	Uwimana Eastern Farm	\N	Kayonza	Kabarondo	\N	\N	\N	\N	\N	\N	\N	2.80	-1.59700000	30.62800000	\N	Sandy Loam	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.079	2026-06-15 11:25:25.079	\N	pending	\N	\N
673e0225-61d4-4f83-a74d-ceb8a4d1f604	fadebf60-23da-4539-9bfa-f336b9b2415e	72431a99-048b-4ba0-9837-342412d6fd90	Alexis Mugenzi	Mugenzi Savanna Farm	\N	Kayonza	Kabarondo	\N	\N	\N	\N	\N	\N	\N	1.60	-1.60200000	30.63500000	\N	Sandy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.099	2026-06-15 11:25:25.099	\N	pending	\N	\N
a8be5879-af12-4128-a465-fa04876a8be7	5697322c-32dd-4c97-a349-da421a9cdcbd	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	Chantal Nkurukiyinka	Nkuru Tea Gardens	\N	Nyamasheke	Kagano	\N	\N	\N	\N	\N	\N	\N	2.10	-2.33500000	29.17800000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.119	2026-06-15 11:25:25.119	\N	pending	\N	\N
a92ddbdd-684c-4d9e-9a69-728ca3e61339	ecc1a97a-efb1-4a2e-bfea-1a761d114ca6	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	Félix Rutagengwa	Rutagengwa Lake Farm	\N	Nyamasheke	Kagano	\N	\N	\N	\N	\N	\N	\N	1.90	-2.34100000	29.18300000	\N	Loamy	river	flood	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.145	2026-06-15 11:25:25.145	\N	pending	\N	\N
d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	fc016103-b504-4195-95dd-fba1c0f0f1bb	0c2b620c-f8a0-4058-aebc-50e410fee038	Fidèle Nshimiyimana	Nshimi Highland Farm	\N	Burera	Rwerere	\N	\N	\N	\N	\N	\N	\N	2.30	-1.47000000	29.85000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.168	2026-06-15 11:25:25.168	\N	pending	\N	\N
958704ff-8558-48fc-98a2-4ef07e511d04	e132efee-2135-4696-828b-0ff38c084fe7	804a741e-6880-4a87-ac14-51f6fc85c5e5	Odette Ingabire	Ingabire Coffee Estate	\N	Nyamagabe	Gasaka	\N	\N	\N	\N	\N	\N	\N	3.20	-2.45200000	29.52000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.195	2026-06-15 11:25:25.195	\N	pending	\N	\N
d201582e-aa22-4517-bd65-fce9435b6ef9	edb9d045-a82d-4f20-b5e5-2a549128f323	804a741e-6880-4a87-ac14-51f6fc85c5e5	Théogène Mugwaneza	Mugwaneza Arabica Farm	\N	Nyamagabe	Gasaka	\N	\N	\N	\N	\N	\N	\N	2.70	-2.46000000	29.52800000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.217	2026-06-15 11:25:25.217	\N	pending	\N	\N
9c040a91-bde6-43da-9292-1d690e3412fb	3482b36c-b79c-4f23-b0c0-7fc3cd0358fa	661adf0b-e027-45e7-a0a4-37caee0cd036	Jean-Paul Habimana	Habimana Banana Grove	\N	Ruhango	Kinazi	\N	\N	\N	\N	\N	\N	\N	1.40	-2.22400000	29.78000000	\N	Loamy	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.238	2026-06-15 11:25:25.238	\N	pending	\N	\N
51b9775b-12f1-4b7f-84de-9277c32ae3e4	a3469761-e403-43b9-b87c-a5a77a7f0a6d	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Yvonne Mutuyimana	Mutuy Green Acres	\N	Rulindo	Base	\N	\N	\N	\N	\N	\N	\N	1.10	-1.72900000	29.96000000	\N	Clay Loam	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.261	2026-06-15 11:25:25.261	\N	pending	\N	\N
7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	2a9c84e6-30e0-4b25-b4b7-9f50f48d131b	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Gabriel Niyonzima	Niyonzima Horticulture	\N	Rulindo	Base	\N	\N	\N	\N	\N	\N	\N	0.90	-1.73500000	29.96700000	\N	Sandy Loam	river	drip	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.284	2026-06-15 11:25:25.284	\N	pending	\N	\N
92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	1652bdd2-357d-4534-a032-fdfe7e656864	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Alice Nyirabashyitsi	Nyira Mixed Farm	\N	Rulindo	Base	\N	\N	\N	\N	\N	\N	\N	1.30	-1.74000000	29.97300000	\N	Loamy	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-06-15 11:25:25.308	2026-06-15 11:25:25.308	\N	pending	\N	\N
\.


--
-- Data for Name: Feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Feedback" (id, "userId", type, category, content, rating, screenshots, status, "adminResponse", "reviewedBy", "reviewedAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: FieldVisitNote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FieldVisitNote" (id, "officerId", "farmerId", "visitDate", notes, "actionItems", "followUpDate", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ForumComment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ForumComment" (id, "postId", "authorId", content, "parentCommentId", "likesCount", "isAcceptedAnswer", "createdAt") FROM stdin;
9454a347-ce98-4378-9e08-4942d03d2eab	dd8c76fc-55f0-4827-9b03-b9f6261b8e38	1652bdd2-357d-4534-a032-fdfe7e656864	Amakuru	\N	0	f	2026-06-15 11:32:11.777
\.


--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ForumPost" (id, "authorId", "cooperativeId", title, content, category, type, priority, "audienceType", "audienceId", "imageUrls", "videoUrls", "attachmentUrls", "likesCount", "commentsCount", "viewsCount", "isPinned", "isAnswered", "isKnowledgeBase", status, "createdAt", "updatedAt") FROM stdin;
dd8c76fc-55f0-4827-9b03-b9f6261b8e38	9c1b7161-64b4-436e-a08f-17ff9f0079e5	\N	Community Post	hello	General	COMMUNITY_POST	normal	GLOBAL	\N	{}	{}	{}	1	1	3	f	f	f	active	2026-06-15 11:28:59.265	2026-06-15 11:36:07.981
2e1279cb-6d44-456d-8a2e-4c262f701f75	1652bdd2-357d-4534-a032-fdfe7e656864	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Community Post	hello	General	COMMUNITY_POST	normal	DISTRICT	Rulindo	{}	{}	{}	0	0	2	f	f	f	active	2026-06-15 11:35:57.148	2026-06-15 11:36:08.507
\.


--
-- Data for Name: GroupMessage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GroupMessage" (id, "cooperativeId", "senderId", "senderName", content, "createdAt") FROM stdin;
\.


--
-- Data for Name: Guide; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Guide" (id, title, crop, category, summary, content, "readingTime", "waterRequirement", "growthPeriod", "optimalTemp", "soilType", icon, "isActive", "createdAt", "updatedAt") FROM stdin;
6047beaa-bd12-48f9-8c11-573f9ab03170	Maize Growing Guide	Maize	Planting	Best practices for spacing, fertilization, and weeding for high-yield maize.	## Introduction\nMaize is a staple crop in Rwanda. Proper planting techniques can significantly increase yield.\n\n## Land Preparation\n- Plough the land to a depth of 20-25cm\n- Ensure proper drainage\n- Apply well-decomposed manure at 10 tonnes per hectare\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 75cm between rows, 25cm between plants\n- Seed rate: 20-25kg per hectare\n- Planting depth: 3-5cm\n\n## Fertilization\n- Apply NPK (17-17-17) at 200kg/ha at planting\n- Top-dress with Urea at 150kg/ha after 4-6 weeks\n\n## Weed Control\n- First weeding: 2-3 weeks after planting\n- Second weeding: 5-6 weeks after planting\n\n## Harvesting\n- Maize matures in 90-120 days\n- Harvest when the husk turns brown\n- Dry to 13-14% moisture content before storage	8	400-600mm	90-120 days	20-30°C	Loamy, well-drained	Sprout	t	2026-06-15 11:25:26.533	2026-06-15 11:25:26.533
1174ba71-88ca-4223-8263-1d7ec178aac6	Pest Management in Beans	Beans	Protection	How to identify and treat common pests in bean plantations organically.	## Common Bean Pests\n\n### Bean Aphids\n- **Symptoms**: Curled leaves, stunted growth\n- **Control**: Use neem oil spray or insecticidal soap\n\n### Bean Fly\n- **Symptoms**: Wilting seedlings, swollen stem base\n- **Control**: Seed dressing with appropriate insecticide\n\n### Bean Rust\n- **Symptoms**: Rust-colored spots on leaves\n- **Control**: Remove infected plants, use resistant varieties\n\n## Preventive Measures\n- Practice crop rotation with non-legumes\n- Use certified disease-free seeds\n- Maintain proper plant spacing for air circulation\n- Remove and destroy crop residues after harvest	7	\N	60-90 days	15-25°C	Well-drained loam	Bug	t	2026-06-15 11:25:26.54	2026-06-15 11:25:26.54
09d1b335-bae6-48bc-86eb-504f70c8b8b1	Drip Irrigation Setup	Rice	Water	Step-by-step guide to installing and maintaining a drip irrigation system.	## Benefits of Drip Irrigation\n- Water savings of 40-60%\n- Reduced weed growth\n- Better nutrient absorption\n- Higher yields\n\n## Components Needed\n1. Water source (tank or tap)\n2. Main line (PVC pipe)\n3. Sub-main lines\n4. Drip tapes/emitters\n5. Filters (screen or disc)\n6. Pressure regulator\n\n## Installation Steps\n\n### Step 1: Plan the Layout\n- Measure your field dimensions\n- Mark rows for crop planting\n- Calculate water requirements\n\n### Step 2: Install Main Line\n- Lay PVC pipe from water source\n- Install filter and pressure regulator\n- Add control valves for each section\n\n### Step 3: Install Drip Tapes\n- Lay drip tapes along crop rows\n- Space emitters according to crop type\n- Connect to sub-main lines\n\n### Step 4: Test the System\n- Flush the system before first use\n- Check for leaks at connections\n- Adjust pressure to 1-2 bars\n\n## Maintenance\n- Clean filters weekly\n- Flush lines monthly\n- Replace damaged emitters promptly\n- Drain system before frost	12	Efficient (40-60% less)	\N	All climates	\N	Droplets	t	2026-06-15 11:25:26.544	2026-06-15 11:25:26.544
93d1ff28-d447-47c1-aa45-0e4bce3eba53	Post-Harvest Handling	Maize	Harvest	Reducing losses during storage and transport of grains.	## Importance of Post-Harvest Handling\nPost-harvest losses in Rwanda can reach 30%. Proper handling preserves quality and ensures food security.\n\n## Harvesting\n- Harvest at the right maturity stage\n- Use clean harvesting tools\n- Avoid damaging grains during harvest\n\n## Drying\n- Sun-dry on clean tarpaulins (not directly on soil)\n- Stir regularly for even drying\n- Dry to 13-14% moisture content\n- Use moisture meter for accuracy\n\n## Shelling/Threshing\n- Shell when grains are properly dry\n- Use mechanical shellers to reduce damage\n- Clean grains after shelling\n\n## Storage\n- Use clean, airtight containers\n- Add natural repellents (neem leaves, chili)\n- Store in a cool, dry place\n- Inspect regularly for pests\n\n## Transportation\n- Use clean, dry sacks\n- Protect from rain and moisture\n- Avoid overfilling sacks which causes grain damage	6	N/A (dry process)	\N	\N	\N	Leaf	t	2026-06-15 11:25:26.548	2026-06-15 11:25:26.548
e747588e-13c4-4fdc-9c89-3462d19d4f41	Tomato Growing Guide	Tomato	Planting	Complete guide to growing healthy tomatoes from nursery to harvest.	## Nursery Establishment\n- Prepare a seedbed of 1m width\n- Mix soil with well-decomposed manure\n- Sow seeds in rows 10cm apart\n- Water gently twice daily\n- Transplant after 3-4 weeks\n\n## Transplanting\n- Space plants 60cm between rows, 45cm between plants\n- Transplant in the evening\n- Water immediately after planting\n\n## Staking\n- Stake plants to keep fruits off the ground\n- Use wooden stakes or trellis system\n- Tie stems loosely with soft material\n\n## Fertilization\n- Apply DAP at transplanting\n- Apply CAN at 3 and 6 weeks after transplanting\n- Side-dress with compost\n\n## Common Diseases\n- **Late blight**: Remove infected leaves, spray with fungicide\n- **Bacterial wilt**: Practice crop rotation, remove infected plants\n\n## Harvesting\n- Harvest starts 60-80 days after transplanting\n- Pick at the breaker stage (first color change)\n- Handle gently to avoid bruising	10	500-800mm	90-110 days	20-27°C	Well-drained sandy loam	Sprout	t	2026-06-15 11:25:26.551	2026-06-15 11:25:26.551
a02eaa1b-6fb4-4ebb-bbed-0c3e5b894834	Soil Conservation Techniques	Beans	Protection	Methods to prevent soil erosion and maintain soil fertility on sloping farmland.	## Why Soil Conservation Matters\nSoil erosion is a major challenge in Rwanda's hilly landscape. Losing topsoil reduces crop yields significantly.\n\n## Terracing\n- Build bench terraces on slopes\n- Maintain terrace risers with grass\n- Use stones where available for reinforcement\n\n## Contour Farming\n- Plough along contour lines\n- Reduces runoff speed\n- Increases water infiltration\n\n## Cover Cropping\n- Plant legumes as ground cover\n- Reduces soil erosion between seasons\n- Adds nitrogen to the soil\n\n## Mulching\n- Apply organic mulch 5-10cm thick\n- Retains soil moisture\n- Suppresses weed growth\n- Adds organic matter when decomposed\n\n## Agroforestry\n- Plant trees on farm boundaries\n- Trees provide shade and wind breaks\n- Leaves add nutrients to soil\n- Roots hold soil together	8	\N	\N	All climates	\N	Leaf	t	2026-06-15 11:25:26.556	2026-06-15 11:25:26.556
0fc72f2f-514b-4b9c-afbe-0349cf586707	Dairy Cow Nutrition	\N	Feeding	Balanced feed formulations for maximizing milk production.	## Nutritional Requirements for Dairy Cows\n\n### Forage (60-70% of diet)\n- Good quality Napier grass\n- Rhodes grass or natural pasture\n- Leguminous forages (desmodium, lucerne)\n\n### Concentrates (30-40% of diet)\n- Maize germ meal\n- Rice bran\n- Cotton seed cake or soybean meal\n- Mineral supplements\n\n## Feeding Schedule\n- Morning: 6-8kg of forage + 2-3kg of concentrate\n- Mid-day: Free access to water + mineral lick\n- Evening: 6-8kg of forage + 2-3kg of concentrate\n\n## Water Requirements\n- A lactating cow needs 60-80 liters of water daily\n- Ensure clean, fresh water at all times\n\n## Mineral Supplementation\n- Provide salt lick blocks\n- Supplement with Calcium and Phosphorus\n- Add Vitamin A, D, E complex\n\n## Signs of Good Nutrition\n- Shiny coat\n- Normal manure consistency\n- High milk yield\n- Regular heat cycles\n- Healthy calves at birth	10	\N	\N	\N	\N	Milk	t	2026-06-15 11:25:26.559	2026-06-15 11:25:26.559
8fa7f7cf-c8de-46f0-8179-f246a21e0a4f	Poultry Disease Prevention	\N	Health	Vaccination schedules and hygiene practices for healthy chickens.	## Essential Vaccinations\n\n### Day-old chicks\n- Newcastle Disease (NDV) vaccine - eye drop\n- Gumboro vaccine\n\n### Week 2\n- NDV booster\n- Fowl Pox vaccine\n\n### Week 4\n- Gumboro booster\n\n### Week 8\n- NDV (killed vaccine) - injection\n\n## Biosecurity Measures\n- Limit visitors to the poultry house\n- Use footbaths with disinfectant\n- Change clothes before entering\n- Keep different age groups separate\n\n## Hygiene Practices\n- Clean and disinfect housing regularly\n- Provide clean bedding (wood shavings)\n- Clean waterers and feeders daily\n- Remove manure frequently\n\n## Common Diseases\n- **Newcastle Disease**: Respiratory distress, green diarrhea, high mortality\n- **Gumboro**: Depression, ruffled feathers, vent picking\n- **Fowl Pox**: Wart-like lesions on comb and wattles\n- **Coccidiosis**: Bloody droppings, reduced feed intake\n\n## Prevention Tips\n- Source chicks from reliable hatcheries\n- Quarantine new birds for 2 weeks\n- Maintain proper ventilation\n- Provide balanced nutrition for immunity	8	\N	\N	\N	\N	Bug	t	2026-06-15 11:25:26.564	2026-06-15 11:25:26.564
7cdbd111-c95f-48ff-b2a9-727f7544375a	Pig Farming Basics	\N	General	A beginner guide to housing, breeding, and feeding pigs.	## Housing Requirements\n- Well-ventilated pigsty\n- Concrete floor with proper drainage\n- Separate areas for feeding, sleeping, and dunging\n- Space: 2-3 sq meters per adult pig\n- Roof to provide shade and rain protection\n\n## Choosing Breeds\n- **Landrace**: Good mothering, long body\n- **Large White**: Fast growth, good for meat\n- **Local breeds**: Hardy, disease-resistant\n- Crossbreeds often combine best traits\n\n## Feeding\n### Grower pigs (20-50kg)\n- 1.5-2kg of balanced feed per day\n- Protein content: 16-18%\n\n### Finisher pigs (50-90kg)\n- 2.5-3kg of balanced feed per day\n- Protein content: 14-16%\n\n### Breeding sows\n- Increase feed during gestation\n- Flush feeding before breeding\n- Extra nutrition during lactation\n\n## Breeding Management\n- Sow reaches breeding age at 6-8 months\n- Gestation period: 114 days (3 months, 3 weeks, 3 days)\n- Litter size: 8-12 piglets\n- Weaning at 4-6 weeks\n\n## Health Management\n- Deworm every 3 months\n- Vaccinate against swine fever\n- Trim hooves if overgrown\n- Monitor for signs of illness: fever, loss of appetite, diarrhea	14	\N	\N	\N	\N	Dog	t	2026-06-15 11:25:26.57	2026-06-15 11:25:26.57
1ab13f70-2773-4f9a-9b1f-74649f26857d	Beans Growing Guide	Beans	Planting	Best practices for planting, managing, and harvesting beans.	## Land Preparation\n- Plough to a depth of 15-20cm\n- Remove weeds and crop residues\n- Prepare raised beds if drainage is poor\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 40cm between rows, 20cm between plants\n- Seed rate: 60-80kg per hectare\n- Planting depth: 3-5cm\n\n## Varieties\n- **Bush beans**: Mature in 60-75 days, no staking needed\n- **Climbing beans**: Mature in 90-110 days, require staking\n\n## Fertilization\n- Apply DAP at 100kg/ha at planting\n- Beans fix their own nitrogen (inoculate seeds)\n- Apply organic manure at 5 tonnes/ha\n\n## Weed Management\n- First weeding: 2-3 weeks after planting\n- Second weeding: before flowering\n- Mulch between rows to suppress weeds\n\n## Harvesting\n- Bush beans: Harvest 60-75 days after planting\n- Climbing beans: Harvest 90-110 days after planting\n- Harvest when pods turn yellow and dry\n- Thresh and clean, then dry to 14% moisture	7	300-500mm	60-110 days	18-25°C	Well-drained loam	Sprout	t	2026-06-15 11:25:26.573	2026-06-15 11:25:26.573
2a12c462-7580-416b-a4de-b166c4e9e628	Rice Growing Guide	Rice	Planting	Complete guide to rice cultivation from nursery to harvest.	## Nursery Preparation\n- Prepare a wet nursery near water source\n- Level the seedbed carefully\n- Soak seeds for 24 hours before sowing\n- Sow pre-germinated seeds evenly\n- Maintain 2-3cm water level\n\n## Land Preparation\n- Plough and puddle the field\n- Level the field for uniform water distribution\n- Apply well-decomposed manure before transplanting\n\n## Transplanting\n- Transplant seedlings at 3-4 leaf stage (20-25 days)\n- Spacing: 20cm x 20cm\n- Transplant 2-3 seedlings per hill\n- Transplant in straight rows\n\n## Water Management\n- Maintain 5-7cm water depth after transplanting\n- Drain field 7 days before harvest\n- Use alternate wetting and drying to save water\n\n## Fertilization\n- Apply NPK at 200kg/ha before transplanting\n- Top-dress with Urea at 100kg/ha at tillering\n- Top-dress with Urea at 50kg/ha at panicle initiation\n\n## Pest Management\n- **Rice blast**: Use resistant varieties\n- **Stem borer**: Remove egg masses from leaves\n- **Rodents**: Keep field edges clean\n\n## Harvesting\n- Harvest when 80% of grains are golden\n- Cut stems 15-20cm above ground\n- Thresh immediately after harvest\n- Dry to 14% moisture content	10	800-1200mm	120-150 days	20-35°C	Clay loam with good water retention	Sprout	t	2026-06-15 11:25:26.576	2026-06-15 11:25:26.576
d94d2676-82dc-40d0-886f-44a582d3c8c8	Irrigation Water Management	Tomato	Water	Efficient water scheduling and management techniques for vegetable farming.	## Water Requirements by Crop Stage\n\n### Nursery Stage\n- Light watering 2-3 times daily\n- Use fine spray to avoid seed displacement\n\n### Vegetative Stage\n- Water every 2-3 days\n- Apply 20-30mm per week\n\n### Flowering Stage\n- Regular watering critical\n- Apply 30-40mm per week\n- Moisture stress causes flower drop\n\n### Fruiting Stage\n- Apply 40-50mm per week\n- Consistent moisture for uniform fruit development\n- Mulch to reduce evaporation\n\n## Irrigation Methods\n\n### Drip Irrigation (Recommended)\n- Water efficiency: 90%\n- Apply directly to root zone\n- Use with fertigation for best results\n\n### Furrow Irrigation\n- Water efficiency: 60%\n- Simple and low-cost\n- Requires well-levelled fields\n\n### Sprinkler Irrigation\n- Water efficiency: 75%\n- Covers large areas quickly\n- Not suitable for windy areas\n\n## Water Quality\n- Test water for salinity\n- Avoid water with high sodium content\n- Filter water to remove sediment\n\n## Scheduling Tips\n- Irrigate early morning or evening\n- Check soil moisture before watering\n- Use rain gauge to track rainfall\n- Adjust schedule based on weather	9	400-600mm	\N	All climates	\N	Droplets	t	2026-06-15 11:25:26.579	2026-06-15 11:25:26.579
88c13752-c44e-4964-a506-4dc58214008e	Organic Farming Practices	Maize	Protection	Natural methods for soil fertility and pest control without synthetic chemicals.	## Principles of Organic Farming\n1. Work with natural systems\n2. Build soil health\n3. Promote biodiversity\n4. Use renewable resources\n5. Minimize external inputs\n\n## Building Soil Fertility\n\n### Composting\n- Layer green materials with dry materials\n- Keep pile moist\n- Turn every 2 weeks\n- Ready in 3-4 months\n\n### Green Manure\n- Plant legumes (mucuna, lablab)\n- Incorporate into soil before flowering\n- Adds nitrogen and organic matter\n\n### Animal Manure\n- Well-decomposed manure\n- Apply 10-15 tonnes per hectare\n- Incorporate into soil before planting\n\n## Natural Pest Control\n\n### Companion Planting\n- Plant marigolds near tomatoes to repel nematodes\n- Plant onions near carrots to repel carrot fly\n- Use garlic spray as general repellent\n\n### Biological Control\n- Attract beneficial insects (ladybugs, lacewings)\n- Use neem-based products\n- Introduce predatory insects\n\n### Cultural Control\n- Crop rotation\n- Intercropping\n- Proper spacing\n- Timely planting\n\n## Certification\n- Transition period: 2-3 years\n- Keep records of all practices\n- Soil tests required\n- Inspection by certifying body	11	\N	\N	\N	\N	Leaf	t	2026-06-15 11:25:26.584	2026-06-15 11:25:26.584
c1ceee8e-4b33-4793-81c0-3080aea406a7	Disease Management in Tomatoes	Tomato	Protection	Identifying and controlling common tomato diseases in Rwandan conditions.	## Common Tomato Diseases\n\n### Late Blight (Phytophthora infestans)\n- **Symptoms**: Dark water-soaked spots on leaves, white mold on undersides\n- **Conditions**: Cool, wet weather (15-20°C, high humidity)\n- **Control**: Remove infected leaves, copper-based fungicide\n\n### Early Blight (Alternaria solani)\n- **Symptoms**: Dark concentric rings on lower leaves\n- **Control**: Mulch around plants, avoid overhead watering\n\n### Bacterial Wilt (Ralstonia solanacearum)\n- **Symptoms**: Sudden wilting, brown vascular tissue\n- **Control**: Use resistant varieties, crop rotation (4+ years)\n\n### Tomato Yellow Leaf Curl Virus\n- **Symptoms**: Yellowing, curling leaves, stunted growth\n- **Control**: Control whiteflies, use virus-free seedlings\n\n## Integrated Disease Management\n1. Use certified disease-free seeds\n2. Practice crop rotation (3-4 years)\n3. Ensure proper spacing for airflow\n4. Remove and destroy infected plants\n5. Use resistant varieties when available\n6. Apply fungicides preventively in high-risk periods\n\n## Fungicide Application Schedule\n- Start 2 weeks after transplanting\n- Apply every 7-14 days depending on weather\n- Alternate fungicides to prevent resistance\n- Stop application 7 days before harvest	9	\N	90-110 days	20-27°C	Well-drained sandy loam	Bug	t	2026-06-15 11:25:26.587	2026-06-15 11:25:26.587
3f9e36a8-6880-4cf5-8c2f-2a899e27d1a5	Harvest and Storage of Grains	Maize	Harvest	Proper techniques for harvesting, drying, and storing grain crops.	## Harvest Timing\n\n### Maize\n- Harvest when black layer forms at kernel tip\n- Moisture content: 25-30% for maize\n- Dry to 13-14% for storage\n\n### Beans\n- Harvest when pods turn yellow-brown\n- Dry pods in sun before shelling\n- Target moisture: 14%\n\n### Rice\n- Harvest at 80% golden color\n- Moisture content: 20-25%\n- Dry to 14% for storage\n\n## Drying Methods\n\n### Sun Drying\n- Spread grains in thin layer (5-10cm)\n- Use clean tarpaulins, not bare ground\n- Stir every 2-3 hours\n- Cover at night and during rain\n- Drying time: 2-5 days depending on weather\n\n### Mechanical Drying\n- Use forced air dryers\n- Temperature: 43-50°C for maize\n- Monitor moisture content regularly\n\n## Storage Structures\n\n### Metal Silos\n- Airtight, rodent-proof\n- Capacity: 500-3000kg\n- Fumigate before sealing\n\n### Hermetic Bags (GrainPro)\n- Airtight plastic bags\n- Capacity: 50-100kg\n- No insect infestation possible\n\n### Traditional Granaries\n- Improved with raised platform\n- Rat guards on supports\n- Regular inspection needed\n\n## Storage Best Practices\n- Clean storage area before new harvest\n- Inspect grains regularly for pests\n- Store at cool temperature\n- Use natural repellents (neem, chili)\n- First-in, first-out for older stocks	10	N/A (post-harvest)	\N	\N	\N	Leaf	t	2026-06-15 11:25:26.591	2026-06-15 11:25:26.591
\.


--
-- Data for Name: IrrigationLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationLog" (id, "scheduleId", "zoneId", "farmerId", action, reason, "triggeredBy", "startTime", "endTime", "executedAt", "durationMinutes", "waterUsedLiters", "waterSource", "triggerSource", status, "createdAt") FROM stdin;
c82f1687-d154-426a-9043-ce4656c8c22d	0d6674b3-9747-4b21-8f28-833287d28d11	5f59c671-4ed4-4803-81d1-41d88778dec5	dcda2652-8201-461b-b66c-199d46559b1a	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:25.943	25	440.00	\N	\N	completed	2026-06-15 11:25:25.945
757f3eb7-2153-4763-b42f-62c3070ffc5b	b86527d3-af18-48b6-8867-96c0a6663faf	7928024a-f101-49d7-8d80-7494e8fb0477	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:25.968	25	346.00	\N	\N	completed	2026-06-15 11:25:25.97
baa5c0f7-6395-4f47-a08c-fbf9f2c9f2df	a3a9d86c-8c05-440f-87d6-b1eeb245a423	be9187f4-ad65-41c7-b8ea-ce4e63278e02	f5fd961a-6846-45f7-b13d-b795bff19cec	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:25.983	25	555.00	\N	\N	completed	2026-06-15 11:25:25.985
0d6608cd-2f40-4164-9636-de228cce3fad	9b36ee2f-c321-4be1-a121-e2695581d794	daed6fbe-d94a-414e-8317-e75e9b8f8d19	0af120c1-d4b7-4719-8102-1013b24681ff	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:25.997	25	395.00	\N	\N	completed	2026-06-15 11:25:25.999
43400246-ac67-4894-b2a0-4dbd84daee8e	ab7a8bf3-3664-4426-b852-aeba1ea86efb	201f5de3-d276-479c-8c1b-b752d90a0241	be27e8d0-183f-4058-93e3-b0b35fd2852d	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.011	25	417.00	\N	\N	completed	2026-06-15 11:25:26.013
b485ea36-44a5-4edc-9fd3-4318e1f61b98	7ef413ac-22eb-424e-b3b9-9558c216bac3	20217f5a-d26d-4863-b3d4-4d6322ae508b	92f6e962-1503-48d8-bd40-96d357dc6858	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.026	25	517.00	\N	\N	completed	2026-06-15 11:25:26.028
476d5422-264f-4958-808d-e3160a76fe64	e90d95c4-5e5b-4740-90f3-0e6252281c20	3af24d1e-ab67-4216-be3b-0f4b81448588	13ff9666-eff8-40ab-be5c-ab7566af2309	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.04	25	345.00	\N	\N	completed	2026-06-15 11:25:26.042
ef555b5d-d73e-4be0-bf60-b36236a8cfc3	95294bd7-ef2c-4ade-a2ea-a4601473d049	feebe497-3146-4180-adbd-d2374ef8d820	11b8cdc7-10ad-4f98-b66a-430f0c630091	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.052	25	332.00	\N	\N	completed	2026-06-15 11:25:26.054
07cdcdaa-fb22-4cf0-94f2-985a9e8354c2	74cd19b1-3f76-405d-9e61-2c137f94b397	2c7bd17d-ec6d-4b06-80d3-ec26f7904e74	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.064	25	456.00	\N	\N	completed	2026-06-15 11:25:26.067
df55274a-80ce-4d3b-b6a5-cb464e2cf1de	070bffaa-1dc7-4a6e-b344-a18cf0fb5932	6f1f6fa3-05dd-4618-93db-721dff77d199	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.077	25	508.00	\N	\N	completed	2026-06-15 11:25:26.08
f85e51fc-817a-4f2f-bd7e-38b1970d2116	f27e92af-05aa-41fd-8f08-17745de22871	68ce5757-5fa6-4a3e-9db5-28c7435e0c62	673e0225-61d4-4f83-a74d-ceb8a4d1f604	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.091	25	481.00	\N	\N	completed	2026-06-15 11:25:26.093
d745759d-2db3-4af9-984f-0e2b0ed92041	0faf5006-fd0f-4162-89fb-b9d74dd823c2	e3fa85da-b7e1-4ab8-a735-50c158542b69	a8be5879-af12-4128-a465-fa04876a8be7	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.103	25	447.00	\N	\N	completed	2026-06-15 11:25:26.105
2a76b860-757d-4dbd-bc92-27215abb79fb	1a14aa73-18fa-493a-a9b9-0c25ef674fdb	2b1a7dcd-bfa9-4e7f-8694-350785ee9f7d	a92ddbdd-684c-4d9e-9a69-728ca3e61339	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.115	25	463.00	\N	\N	completed	2026-06-15 11:25:26.117
27d410e0-d25c-45e7-80b8-49c42e78e834	f0287dbd-a42a-40a4-acf5-5e9bfd12fefa	71f2209b-88cd-466e-98a9-a42066b113ed	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.129	25	318.00	\N	\N	completed	2026-06-15 11:25:26.131
5acb85ba-235c-4600-a992-2cf482b6b5c9	ea90ff87-9628-4862-a042-d9f69973247b	7572b4a5-08f5-471c-841c-cdb485715540	958704ff-8558-48fc-98a2-4ef07e511d04	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.141	25	384.00	\N	\N	completed	2026-06-15 11:25:26.143
5b3c2b24-dde7-4c8e-884e-898e711306f0	637a964d-6ce5-4ef9-8922-e214cced9adf	f8d50016-cd99-47cd-a694-1df9776c5883	d201582e-aa22-4517-bd65-fce9435b6ef9	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.16	25	536.00	\N	\N	completed	2026-06-15 11:25:26.162
b99f6f20-bf11-4819-89af-6da4f89e9a5c	69948969-4b30-48d3-876d-189aac17a746	c39dd9a0-d454-400f-97a3-e9a475ce5b3b	9c040a91-bde6-43da-9292-1d690e3412fb	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.171	25	457.00	\N	\N	completed	2026-06-15 11:25:26.173
824ef05d-387b-4257-8546-225d397ad27c	242c63a8-281a-4887-82f3-83a3720887db	a6d6377f-00df-445f-9aaa-cb5eb9fd662c	51b9775b-12f1-4b7f-84de-9277c32ae3e4	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.183	25	568.00	\N	\N	completed	2026-06-15 11:25:26.185
9e13946a-253e-4a35-b0bc-777ddc964316	e83713f4-ec93-42f4-a831-e5d1cbe05acb	670bcf1c-051c-48dc-afc2-0f1b686f57d4	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.195	25	453.00	\N	\N	completed	2026-06-15 11:25:26.197
ce841e3a-d94b-4347-a8fe-7e45e8ee4a76	06b599bc-d81f-4be5-946e-57c76b33cb32	b90a9424-892b-4a0b-96da-b248d2210b54	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	START	Scheduled irrigation	schedule	\N	\N	2026-06-14 11:25:26.208	25	444.00	\N	\N	completed	2026-06-15 11:25:26.21
\.


--
-- Data for Name: IrrigationSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationSchedule" (id, "farmerId", "cropId", "scheduleType", "startTime", "durationMinutes", frequency, "daysOfWeek", "waterSource", "waterAmountLiters", "pumpEnabled", "valveEnabled", "isActive", "createdAt", "updatedAt") FROM stdin;
0d6674b3-9747-4b21-8f28-833287d28d11	dcda2652-8201-461b-b66c-199d46559b1a	\N	daily	06:00	37	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:25.929	2026-06-15 11:25:25.929
b86527d3-af18-48b6-8867-96c0a6663faf	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	daily	05:00	26	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:25.965	2026-06-15 11:25:25.965
a3a9d86c-8c05-440f-87d6-b1eeb245a423	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	daily	06:00	25	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:25.98	2026-06-15 11:25:25.98
9b36ee2f-c321-4be1-a121-e2695581d794	0af120c1-d4b7-4719-8102-1013b24681ff	\N	daily	06:00	24	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:25.994	2026-06-15 11:25:25.994
ab7a8bf3-3664-4426-b852-aeba1ea86efb	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	daily	05:00	21	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.008	2026-06-15 11:25:26.008
7ef413ac-22eb-424e-b3b9-9558c216bac3	92f6e962-1503-48d8-bd40-96d357dc6858	\N	daily	05:00	22	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.023	2026-06-15 11:25:26.023
e90d95c4-5e5b-4740-90f3-0e6252281c20	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	daily	07:00	35	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.037	2026-06-15 11:25:26.037
95294bd7-ef2c-4ade-a2ea-a4601473d049	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	daily	06:00	23	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.049	2026-06-15 11:25:26.049
74cd19b1-3f76-405d-9e61-2c137f94b397	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	daily	05:00	32	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.062	2026-06-15 11:25:26.062
070bffaa-1dc7-4a6e-b344-a18cf0fb5932	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	daily	06:00	30	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.075	2026-06-15 11:25:26.075
f27e92af-05aa-41fd-8f08-17745de22871	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	daily	06:00	26	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.088	2026-06-15 11:25:26.088
0faf5006-fd0f-4162-89fb-b9d74dd823c2	a8be5879-af12-4128-a465-fa04876a8be7	\N	daily	05:00	22	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.1	2026-06-15 11:25:26.1
1a14aa73-18fa-493a-a9b9-0c25ef674fdb	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	daily	07:00	33	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.112	2026-06-15 11:25:26.112
f0287dbd-a42a-40a4-acf5-5e9bfd12fefa	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	daily	05:00	32	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.125	2026-06-15 11:25:26.125
ea90ff87-9628-4862-a042-d9f69973247b	958704ff-8558-48fc-98a2-4ef07e511d04	\N	daily	06:00	36	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.139	2026-06-15 11:25:26.139
637a964d-6ce5-4ef9-8922-e214cced9adf	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	daily	06:00	39	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.157	2026-06-15 11:25:26.157
69948969-4b30-48d3-876d-189aac17a746	9c040a91-bde6-43da-9292-1d690e3412fb	\N	daily	07:00	23	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.169	2026-06-15 11:25:26.169
242c63a8-281a-4887-82f3-83a3720887db	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	daily	06:00	29	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.18	2026-06-15 11:25:26.18
e83713f4-ec93-42f4-a831-e5d1cbe05acb	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	daily	07:00	37	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.193	2026-06-15 11:25:26.193
06b599bc-d81f-4be5-946e-57c76b33cb32	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	daily	05:00	31	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-15 11:25:26.205	2026-06-15 11:25:26.205
\.


--
-- Data for Name: IrrigationZone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationZone" (id, "farmerId", name, "sizeHectares", "cropType", "soilType", "isActive", status, "lastIrrigated", "nextScheduled", "moistureLevel", temperature, "createdAt", "updatedAt") FROM stdin;
5f59c671-4ed4-4803-81d1-41d88778dec5	dcda2652-8201-461b-b66c-199d46559b1a	Main Plot	1.80	maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:25.918	2026-06-15 11:25:25.918
7928024a-f101-49d7-8d80-7494e8fb0477	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	Main Plot	1.30	potato	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:25.961	2026-06-15 11:25:25.961
be9187f4-ad65-41c7-b8ea-ce4e63278e02	f5fd961a-6846-45f7-b13d-b795bff19cec	Main Plot	2.10	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:25.976	2026-06-15 11:25:25.976
daed6fbe-d94a-414e-8317-e75e9b8f8d19	0af120c1-d4b7-4719-8102-1013b24681ff	Main Plot	1.00	coffee	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:25.991	2026-06-15 11:25:25.991
201f5de3-d276-479c-8c1b-b752d90a0241	be27e8d0-183f-4058-93e3-b0b35fd2852d	Main Plot	1.50	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.005	2026-06-15 11:25:26.005
20217f5a-d26d-4863-b3d4-4d6322ae508b	92f6e962-1503-48d8-bd40-96d357dc6858	Main Plot	0.80	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.019	2026-06-15 11:25:26.019
3af24d1e-ab67-4216-be3b-0f4b81448588	13ff9666-eff8-40ab-be5c-ab7566af2309	Main Plot	1.40	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.033	2026-06-15 11:25:26.033
feebe497-3146-4180-adbd-d2374ef8d820	11b8cdc7-10ad-4f98-b66a-430f0c630091	Main Plot	2.40	rice	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.046	2026-06-15 11:25:26.046
2c7bd17d-ec6d-4b06-80d3-ec26f7904e74	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	Main Plot	2.80	rice	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.058	2026-06-15 11:25:26.058
6f1f6fa3-05dd-4618-93db-721dff77d199	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	Main Plot	2.00	cassava	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.071	2026-06-15 11:25:26.071
68ce5757-5fa6-4a3e-9db5-28c7435e0c62	673e0225-61d4-4f83-a74d-ceb8a4d1f604	Main Plot	1.10	cassava	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.085	2026-06-15 11:25:26.085
e3fa85da-b7e1-4ab8-a735-50c158542b69	a8be5879-af12-4128-a465-fa04876a8be7	Main Plot	1.50	tea	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.097	2026-06-15 11:25:26.097
2b1a7dcd-bfa9-4e7f-8694-350785ee9f7d	a92ddbdd-684c-4d9e-9a69-728ca3e61339	Main Plot	1.30	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.108	2026-06-15 11:25:26.108
71f2209b-88cd-466e-98a9-a42066b113ed	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	Main Plot	1.60	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.122	2026-06-15 11:25:26.122
7572b4a5-08f5-471c-841c-cdb485715540	958704ff-8558-48fc-98a2-4ef07e511d04	Main Plot	2.20	coffee	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.135	2026-06-15 11:25:26.135
f8d50016-cd99-47cd-a694-1df9776c5883	d201582e-aa22-4517-bd65-fce9435b6ef9	Main Plot	1.90	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.154	2026-06-15 11:25:26.154
c39dd9a0-d454-400f-97a3-e9a475ce5b3b	9c040a91-bde6-43da-9292-1d690e3412fb	Main Plot	1.00	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.165	2026-06-15 11:25:26.165
a6d6377f-00df-445f-9aaa-cb5eb9fd662c	51b9775b-12f1-4b7f-84de-9277c32ae3e4	Main Plot	0.80	beans	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.177	2026-06-15 11:25:26.177
670bcf1c-051c-48dc-afc2-0f1b686f57d4	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	Main Plot	0.60	maize	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.19	2026-06-15 11:25:26.19
b90a9424-892b-4a0b-96da-b248d2210b54	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	Main Plot	0.90	beans	\N	t	idle	\N	\N	\N	\N	2026-06-15 11:25:26.202	2026-06-15 11:25:26.202
\.


--
-- Data for Name: Livestock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Livestock" (id, "farmerId", "animalType", breed, "tagNumber", "birthDate", "purchaseDate", "weightKg", "healthStatus", "lastVaccinationDate", "nextVaccinationDue", "feedingRegime", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: MarketPrice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MarketPrice" (id, "cropId", "marketId", "marketName", district, "priceRwfPerKg", currency, trend, "trendPercentage", "recordedAt", source, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketplaceListing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MarketplaceListing" (id, "cooperativeId", "productName", "cropId", quantity, unit, "pricePerUnit", "totalPrice", "availableQuantity", "harvestDate", quality, status, "listedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MemberDue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MemberDue" (id, "cooperativeId", "userId", amount, period, status, "dueDate", "paidAt", "paidById", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MemberRequest; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MemberRequest" (id, "cooperativeId", "userId", status, "requestedAt", "reviewedAt", "reviewedBy") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, "userId", title, message, type, priority, metadata, channel, "sentAt", status, "createdAt") FROM stdin;
33c5a5d8-e622-41af-ad7d-cdebe11b0449	9c1b7161-64b4-436e-a08f-17ff9f0079e5	New Reply	Someone replied to your post.	COMMUNITY_COMMENT	normal	{"postId": "dd8c76fc-55f0-4827-9b03-b9f6261b8e38", "commentId": "9454a347-ce98-4378-9e08-4942d03d2eab"}	IN_APP,SOCKET,FCM	\N	pending	2026-06-15 11:32:11.905
ba24152b-129b-426e-bb69-c21791f18900	9c1b7161-64b4-436e-a08f-17ff9f0079e5	New Like	Someone liked your post.	COMMUNITY_LIKE	low	{"postId": "dd8c76fc-55f0-4827-9b03-b9f6261b8e38"}	IN_APP,SOCKET,FCM	\N	pending	2026-06-15 11:36:03.295
\.


--
-- Data for Name: NotificationDelivery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationDelivery" (id, "notificationId", channel, status, "deliveredAt", "failedAt", "failureReason") FROM stdin;
e5cc59ab-5f9d-4ab3-89ca-651869b760d7	33c5a5d8-e622-41af-ad7d-cdebe11b0449	FCM	FAILED	\N	2026-06-15 11:32:12.03	FCM failed to deliver to any device
8637f3db-5a5a-4e13-82fd-c8358c9a158c	33c5a5d8-e622-41af-ad7d-cdebe11b0449	IN_APP	SENT	2026-06-15 11:32:12.003	\N	\N
0f464601-4a21-4e66-bec0-ff9608baa6f7	33c5a5d8-e622-41af-ad7d-cdebe11b0449	SOCKET	SENT	2026-06-15 11:32:12.003	\N	\N
7c366e82-e610-4965-bc97-1df2670832a2	ba24152b-129b-426e-bb69-c21791f18900	IN_APP	SENT	2026-06-15 11:36:03.324	\N	\N
4323ebab-cf10-4ded-99bf-1479916fd684	ba24152b-129b-426e-bb69-c21791f18900	SOCKET	SENT	2026-06-15 11:36:03.324	\N	\N
3dd611e7-ff0a-4e44-8597-7843f7d6f68c	ba24152b-129b-426e-bb69-c21791f18900	FCM	FAILED	\N	2026-06-15 11:36:03.336	FCM failed to deliver to any device
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
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "userId", amount, currency, provider, "phoneNumber", "paymentType", description, status, reference, "transactionId", "externalReference", "completedAt", "failureReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PostLike; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostLike" (id, "postId", "userId", "createdAt") FROM stdin;
12d22754-4405-4a83-a355-6299efb65042	dd8c76fc-55f0-4827-9b03-b9f6261b8e38	1652bdd2-357d-4534-a032-fdfe7e656864	2026-06-15 11:36:03.266
\.


--
-- Data for Name: PostReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostReport" (id, "postId", "userId", reason, "createdAt") FROM stdin;
72eff616-e912-4141-8cad-700362d8f2e1	2e1279cb-6d44-456d-8a2e-4c262f701f75	9c1b7161-64b4-436e-a08f-17ff9f0079e5	Inappropriate content	2026-06-15 11:36:19.918
\.


--
-- Data for Name: PostView; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostView" (id, "postId", "userId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: PriceAlert; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PriceAlert" (id, "userId", "cropId", "marketId", "targetPrice", "currentPrice", "alertType", "isActive", "isTriggered", "lastTriggered", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Recommendation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Recommendation" (id, "farmerId", type, title, message, recommendation, confidence, priority, "actionRequired", "isRead", details, "generatedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: RecommendationRule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RecommendationRule" (id, name, description, type, enabled, conditions, priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "createdAt") FROM stdin;
9c532106-56ff-468d-8720-ac114863b83a	9c1b7161-64b4-436e-a08f-17ff9f0079e5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YzFiNzE2MS02NGI0LTQzNmUtYTA4Zi0xN2ZmOWYwMDc5ZTUiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MTUyMjkwOSwiZXhwIjoxNzgyMTI3NzA5fQ.JH2g7oeiSkpPFYmBV_VBDKuRrB9ZvVwTCsKaF76r1nc	2026-06-22 11:28:29.34	2026-06-15 11:28:29.34
46078570-9291-433d-b640-10d0c0692716	1652bdd2-357d-4534-a032-fdfe7e656864	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNjUyYmRkMi0zNTdkLTQ1MzQtYTAzMi1mZGZlN2U2NTY4NjQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MTUyNDE2MSwiZXhwIjoxNzgyMTI4OTYxfQ.O4zNH_14TTNGP3b-AZUi5208zmnfRFKSsmlOfOlQbeg	2026-06-22 11:49:21.531	2026-06-15 11:29:59.889
454846d9-7989-45d1-aac8-cfd87ee19f50	00d4daa4-ead1-413a-9e43-bc07423fef4b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMGQ0ZGFhNC1lYWQxLTQxM2EtOWU0My1iYzA3NDIzZmVmNGIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MTUyNDE2OSwiZXhwIjoxNzgyMTI4OTY5fQ.9EVjd7Y6bV5hNfJG1XU_lNVruRtV2ZMK8WbP1xq3QVs	2026-06-22 11:49:29.922	2026-06-15 11:26:02.44
\.


--
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Refund" (id, "paymentId", amount, reason, status, "refundTransactionId", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Report" (id, "farmerId", "cooperativeId", "reportType", "periodStart", "periodEnd", content, "pdfUrl", status, "createdAt", "approvedBy", "approvedAt", "generatedById") FROM stdin;
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Resource" (id, "cooperativeId", name, description, "resourceType", quantity, unit, "availableQuantity", condition, location, "isAvailable", "addedBy", "createdAt", "updatedAt") FROM stdin;
9adaf3e1-9487-4049-bfe4-a1f62c1f5e5d	a8f1d911-7ec1-41d6-8fb2-90c4f0c68a81	Tractor A1	John Deere 5075E for plowing	equipment	\N	\N	\N	\N	\N	t	2a364931-6efb-45fe-a4af-484440f20fc9	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
feb24c9a-242c-41ef-9f5b-f2e3c8247e1f	a7706967-97ef-415d-ada9-b25daf67d6e3	Sprayer Unit B2	Motorised crop sprayer	equipment	\N	\N	\N	\N	\N	t	af45d49f-dc0c-4251-b84d-4b6e03577d7c	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
c33413a5-269a-47e2-bd4f-b938231b1d71	c8dd0cd8-0603-4cd8-b8ce-3c04f2a95eed	Storage Silo 1	10-tonne grain storage silo	storage	\N	\N	\N	\N	\N	t	b0693c8a-162f-4393-8194-9e7a43713530	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
2942d4b0-0923-4074-96d5-1b4fc87e018c	4b9dc6c0-b9cc-4439-90b5-e0c97ca37a1d	Water Pump P1	Diesel water pump for irrigation	equipment	\N	\N	\N	\N	\N	t	5c98983f-f01c-4c55-b478-0da7339f87b8	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
32c5917c-efce-4150-a40d-8b7c9d47c83b	72431a99-048b-4ba0-9837-342412d6fd90	Harvester H1	Combine harvester for maize	equipment	\N	\N	\N	\N	\N	t	9b2f74f2-6b99-4799-acb6-786cdf46a9e7	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
a85a87cf-ca75-42c4-b317-1cefb86b60ff	8f4e7d42-fa55-465a-b705-3b05d2a4eb00	Seed Store	Certified seed storage facility	storage	\N	\N	\N	\N	\N	t	79d7bc71-5b5f-4fe9-8acc-b90365a9c90d	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
3bed05c8-8fa3-4753-9b9d-fef370f1735e	06dbba70-4e27-4ce4-9e10-aa07668bb0be	Processing Unit P2	Coffee wet processing station	equipment	\N	\N	\N	\N	\N	t	d740ba34-c911-4f00-b594-a4792511bb1a	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
a67a4b7a-2e6b-4d10-b32d-02676e87c247	0c2b620c-f8a0-4058-aebc-50e410fee038	Greenhouse G1	Seedling greenhouse 200m²	storage	\N	\N	\N	\N	\N	t	ab3ee7e4-5912-4f65-ab2c-a327d54715c9	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
c33f0583-301a-4196-8298-77c71569e7d5	661adf0b-e027-45e7-a0a4-37caee0cd036	Drip Kit D1	Drip irrigation kit 2 hectares	equipment	\N	\N	\N	\N	\N	t	914fb936-6720-482b-a6ee-32c68588d281	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
4af06a8f-831a-49ca-b412-2837c3cb42b5	804a741e-6880-4a87-ac14-51f6fc85c5e5	Truck T1	Transport truck 3-tonne capacity	equipment	\N	\N	\N	\N	\N	t	8b31026e-9d04-4272-b30e-b5acd6bec14b	2026-06-15 11:25:24.722	2026-06-15 11:25:24.722
\.


--
-- Data for Name: ResourceBooking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceBooking" (id, "resourceId", "memberId", quantity, "startDate", "endDate", status, "deliveryStatus", "deliveryDate", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RevokedToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RevokedToken" (id, token, "userId", "revokedAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: Season; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Season" (id, name, "startMonth", "endMonth", description, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sensor" (id, "farmerId", "sensorType", "serialNumber", "locationOnFarm", "installationDate", "calibrationDate", "isActive", "lastReadingAt", "batteryLevel", "firmwareVersion", "createdAt", "deletedAt") FROM stdin;
3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	soil_moisture	SN-AG-559B1A	\N	\N	\N	t	\N	72.00	\N	2026-06-15 11:25:25.548	\N
3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	soil_moisture	SN-AG-173AD7	\N	\N	\N	t	\N	70.00	\N	2026-06-15 11:25:25.598	\N
c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	soil_moisture	SN-AG-F19CEC	\N	\N	\N	t	\N	74.00	\N	2026-06-15 11:25:25.617	\N
0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	soil_moisture	SN-AG-4681FF	\N	\N	\N	t	\N	87.00	\N	2026-06-15 11:25:25.636	\N
839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	soil_moisture	SN-AG-D2852D	\N	\N	\N	t	\N	70.00	\N	2026-06-15 11:25:25.651	\N
5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	soil_moisture	SN-AG-DC6858	\N	\N	\N	t	\N	66.00	\N	2026-06-15 11:25:25.67	\N
a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	soil_moisture	SN-AG-AF2309	\N	\N	\N	t	\N	76.00	\N	2026-06-15 11:25:25.686	\N
cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	soil_moisture	SN-AG-630091	\N	\N	\N	t	\N	65.00	\N	2026-06-15 11:25:25.705	\N
47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	soil_moisture	SN-AG-5F7276	\N	\N	\N	t	\N	67.00	\N	2026-06-15 11:25:25.721	\N
81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	soil_moisture	SN-AG-1C6E27	\N	\N	\N	t	\N	60.00	\N	2026-06-15 11:25:25.736	\N
1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	soil_moisture	SN-AG-D1F604	\N	\N	\N	t	\N	75.00	\N	2026-06-15 11:25:25.75	\N
c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	soil_moisture	SN-AG-6A8BE7	\N	\N	\N	t	\N	75.00	\N	2026-06-15 11:25:25.762	\N
4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	soil_moisture	SN-AG-E61339	\N	\N	\N	t	\N	93.00	\N	2026-06-15 11:25:25.784	\N
94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	soil_moisture	SN-AG-8883F1	\N	\N	\N	t	\N	67.00	\N	2026-06-15 11:25:25.8	\N
25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	soil_moisture	SN-AG-511D04	\N	\N	\N	t	\N	94.00	\N	2026-06-15 11:25:25.815	\N
2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	soil_moisture	SN-AG-5B6EF9	\N	\N	\N	t	\N	96.00	\N	2026-06-15 11:25:25.832	\N
a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	soil_moisture	SN-AG-3412FB	\N	\N	\N	t	\N	99.00	\N	2026-06-15 11:25:25.854	\N
b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	soil_moisture	SN-AG-2AE3E4	\N	\N	\N	t	\N	77.00	\N	2026-06-15 11:25:25.87	\N
0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	soil_moisture	SN-AG-C3DB1C	\N	\N	\N	t	\N	88.00	\N	2026-06-15 11:25:25.885	\N
2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	soil_moisture	SN-AG-17AFB1	\N	\N	\N	t	\N	66.00	\N	2026-06-15 11:25:25.9	\N
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
26d0beff-f105-41dc-bb16-47f67131c883	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	28.00	18.00	\N	5.40	\N	\N	\N	\N	2026-06-15 09:25:25.561
24d57fed-1948-4305-94b0-db092bb95797	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	32.00	18.80	\N	5.60	\N	\N	\N	\N	2026-06-15 11:25:25.561
045819d6-a21c-4f25-803d-09b94791414c	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	35.00	21.00	\N	5.60	\N	\N	\N	\N	2026-06-15 09:25:25.601
41689bd5-a570-4abe-b5b9-6df78ce0f700	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	40.00	22.20	\N	5.80	\N	\N	\N	\N	2026-06-15 11:25:25.601
38d4b55f-d6a6-4671-b5ae-e96591ef9f15	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	42.00	24.00	\N	5.70	\N	\N	\N	\N	2026-06-15 09:25:25.62
452dce8d-a415-47b6-a340-e6cf35f4eab3	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	48.00	25.60	\N	5.90	\N	\N	\N	\N	2026-06-15 11:25:25.62
68788eab-5f82-4e2d-9d1d-dc4c81501335	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	49.00	27.00	\N	5.90	\N	\N	\N	\N	2026-06-15 09:25:25.639
ea5e5a2f-82d0-404d-b785-b5a0cd1de973	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	56.00	29.00	\N	6.10	\N	\N	\N	\N	2026-06-15 11:25:25.639
7b5876fd-a9b8-4995-bf39-5b379aa64b13	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	56.00	30.00	\N	6.10	\N	\N	\N	\N	2026-06-15 09:25:25.654
a2c07f89-0551-43b2-8cdd-77369aa5df85	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	64.00	30.80	\N	6.30	\N	\N	\N	\N	2026-06-15 11:25:25.654
bfcb32f3-ce49-48ba-965e-28b8bb03b1dd	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	63.00	20.00	\N	6.30	\N	\N	\N	\N	2026-06-15 09:25:25.673
e77579f6-a377-4456-b9c0-6c0a8ae68910	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	67.00	21.20	\N	6.50	\N	\N	\N	\N	2026-06-15 11:25:25.673
688b13b8-c84d-4feb-83e6-c387cb89431f	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	28.00	23.00	\N	6.40	\N	\N	\N	\N	2026-06-15 09:25:25.689
5df53d4b-2a78-40af-9696-522dd956c418	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	33.00	24.60	\N	6.60	\N	\N	\N	\N	2026-06-15 11:25:25.689
573cf0a6-3ac0-4559-8b88-e9c0c1fd9d78	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	35.00	26.00	\N	6.60	\N	\N	\N	\N	2026-06-15 09:25:25.708
f01ccc32-f7fe-4907-b923-b01387c2f680	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	41.00	28.00	\N	6.80	\N	\N	\N	\N	2026-06-15 11:25:25.708
2e665d63-02f4-48a8-bb76-d5a3b7ec150f	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	42.00	29.00	\N	6.80	\N	\N	\N	\N	2026-06-15 09:25:25.724
6305be4e-c8c0-4bdd-b419-383387089543	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	49.00	29.80	\N	7.00	\N	\N	\N	\N	2026-06-15 11:25:25.724
621c725a-440f-446f-88eb-df694f71a88a	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	49.00	19.00	\N	6.90	\N	\N	\N	\N	2026-06-15 09:25:25.738
ccb4c51d-dbe0-4804-92ed-549faaa36506	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	57.00	20.20	\N	7.10	\N	\N	\N	\N	2026-06-15 11:25:25.738
9fa68a39-4a6d-46ce-9aca-46af78d78e16	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	56.00	22.00	\N	7.10	\N	\N	\N	\N	2026-06-15 09:25:25.752
d6c1e571-7549-4134-9384-2120622b829e	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	60.00	23.60	\N	7.30	\N	\N	\N	\N	2026-06-15 11:25:25.752
f38e4f28-7e89-482d-8392-d73d80754015	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	63.00	25.00	\N	5.50	\N	\N	\N	\N	2026-06-15 09:25:25.772
197ec304-8067-44e7-9669-21cf21052c2d	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	68.00	27.00	\N	5.70	\N	\N	\N	\N	2026-06-15 11:25:25.772
8861d4ce-4147-49d2-b19e-e3ce96482a14	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	28.00	28.00	\N	5.60	\N	\N	\N	\N	2026-06-15 09:25:25.786
2fdb28fe-b583-4ca1-b6ad-8887d7fdbfaa	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	34.00	28.80	\N	5.80	\N	\N	\N	\N	2026-06-15 11:25:25.786
b508e173-d2df-48f1-b7b0-97e4dc76e64c	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	35.00	18.00	\N	5.80	\N	\N	\N	\N	2026-06-15 09:25:25.802
f45ac452-565a-423c-a8e1-ef011a87a379	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	42.00	19.20	\N	6.00	\N	\N	\N	\N	2026-06-15 11:25:25.802
0f5aae85-459c-4c44-9568-bede95955354	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	42.00	21.00	\N	6.00	\N	\N	\N	\N	2026-06-15 09:25:25.818
1dffdd37-dbf1-43d3-a492-985e8ddbbdbe	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	50.00	22.60	\N	6.20	\N	\N	\N	\N	2026-06-15 11:25:25.818
a15f24c1-0c41-4c14-b1b2-2aaebbcc82a6	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	49.00	24.00	\N	6.20	\N	\N	\N	\N	2026-06-15 09:25:25.834
418fdac4-1384-4aaa-99b0-00266e8abf9e	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	53.00	26.00	\N	6.40	\N	\N	\N	\N	2026-06-15 11:25:25.834
12766b47-67f5-49ca-ad2c-367db480d51c	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	56.00	27.00	\N	6.30	\N	\N	\N	\N	2026-06-15 09:25:25.857
b3e8db45-2f7d-4126-a219-413d5780e368	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	61.00	27.80	\N	6.50	\N	\N	\N	\N	2026-06-15 11:25:25.857
9851d3d8-1af7-4e06-8da7-39bf5d85179e	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	63.00	30.00	\N	6.50	\N	\N	\N	\N	2026-06-15 09:25:25.872
47d1f74d-b14c-461f-a958-6f123dee22fe	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	69.00	31.20	\N	6.70	\N	\N	\N	\N	2026-06-15 11:25:25.873
2b947043-096a-4cbb-9a27-f452349fb7e8	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	28.00	20.00	\N	6.70	\N	\N	\N	\N	2026-06-15 09:25:25.888
1b3c3b07-7b19-43b4-ac91-1112931ce853	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	35.00	21.60	\N	6.90	\N	\N	\N	\N	2026-06-15 11:25:25.888
7ed0e593-4bda-494a-9c29-7d87d4077284	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	35.00	23.00	\N	6.80	\N	\N	\N	\N	2026-06-15 09:25:25.902
b8e8de2a-770b-4294-a529-509425f1a548	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	43.00	25.00	\N	7.00	\N	\N	\N	\N	2026-06-15 11:25:25.902
013bae26-1a34-46f4-a1b8-816263f2470d	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	53.00	22.70	\N	5.71	79.00	28.00	106.00	\N	2026-06-15 11:34:05.076
b8158c8b-171c-4833-bea0-f8e19c60fb19	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	70.00	18.20	\N	6.72	71.00	37.00	115.00	\N	2026-06-15 11:34:05.104
5deb1584-38e4-405c-b579-8166ee4263ce	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	77.00	25.30	\N	6.36	69.00	28.00	238.00	\N	2026-06-15 11:34:05.117
cd2cba2d-4e6c-49b1-a14c-6deab5d07ed7	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	64.00	20.00	\N	7.08	35.00	10.00	202.00	\N	2026-06-15 11:34:05.129
08bd6948-f824-43f9-8f85-a74ccb4efc26	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	66.00	18.70	\N	7.05	59.00	22.00	237.00	\N	2026-06-15 11:34:05.143
1e11fc33-48d4-4cac-9b9f-0d67418c4729	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	55.00	18.00	\N	6.31	40.00	49.00	217.00	\N	2026-06-15 11:34:05.157
fd2262fe-0445-4577-81d4-5e1c96cb36bf	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	55.00	21.50	\N	5.93	52.00	29.00	205.00	\N	2026-06-15 11:34:05.174
8307430d-923f-4159-9d4d-c682ec8678e3	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	78.00	23.90	\N	6.19	44.00	20.00	124.00	\N	2026-06-15 11:34:05.188
654c390c-d32c-4dc9-9531-64492f1ec24f	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	45.00	27.30	\N	5.82	39.00	20.00	216.00	\N	2026-06-15 11:34:05.199
fba9714d-b114-44c4-b59f-cf25b605a0ae	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	63.00	24.80	\N	7.13	38.00	11.00	140.00	\N	2026-06-15 11:34:05.216
198876fd-ae00-491d-90be-7977fd957c4e	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	64.00	23.20	\N	6.71	47.00	45.00	139.00	\N	2026-06-15 11:34:05.229
ef2e8c6b-46af-4aa8-9e8c-af91ec9b5aa6	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	61.00	25.70	\N	7.10	26.00	21.00	243.00	\N	2026-06-15 11:34:05.243
4cb207f3-d5e3-4b96-9047-d81e1a56e1d3	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	74.00	23.90	\N	5.61	36.00	48.00	120.00	\N	2026-06-15 11:34:05.252
76ff6f03-8c48-41e2-81b0-9a2ee22b06cd	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	46.00	25.90	\N	6.81	36.00	13.00	116.00	\N	2026-06-15 11:34:05.264
c641fe59-57e4-4b45-ba1e-2565795ae7e5	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	68.00	20.20	\N	6.30	25.00	31.00	181.00	\N	2026-06-15 11:34:05.277
ca545841-9944-4b24-8418-3040e0f8b3f8	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	54.00	21.90	\N	7.27	74.00	37.00	233.00	\N	2026-06-15 11:34:05.289
bfce4d72-a991-4eda-b2bf-d4178b79c906	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	76.00	20.00	\N	7.05	24.00	43.00	188.00	\N	2026-06-15 11:34:05.305
2fb5a610-9d32-4f5d-a64a-bbe631494948	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	75.00	23.00	\N	7.45	80.00	46.00	197.00	\N	2026-06-15 11:34:05.32
fa61ff35-fdc0-482f-b9c4-35ccf7f4165b	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	55.00	23.30	\N	6.22	78.00	48.00	132.00	\N	2026-06-15 11:34:05.333
201dde94-0c4c-426e-a3d7-04468ff152ac	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	74.00	26.10	\N	6.85	73.00	31.00	243.00	\N	2026-06-15 11:34:05.347
c2b4f31e-1748-43c6-84df-0022aa6d45cc	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	70.00	24.80	\N	7.13	59.00	41.00	117.00	\N	2026-06-15 11:49:05.103
a0c84edb-ca94-42a8-9869-efa60b8e9437	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	52.00	19.60	\N	6.62	38.00	45.00	202.00	\N	2026-06-15 11:49:05.129
4eda81b9-f229-4920-937c-5d4427ee2edd	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	47.00	25.80	\N	7.38	20.00	14.00	114.00	\N	2026-06-15 11:49:05.144
aa3e1626-8696-4849-966d-69fa09af62c1	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	51.00	24.80	\N	6.35	41.00	29.00	158.00	\N	2026-06-15 11:49:05.159
6b3b6a66-ffa0-4532-bf89-81e2a5d89148	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	61.00	18.30	\N	7.29	45.00	12.00	153.00	\N	2026-06-15 11:49:05.179
83e4d5fc-a3e4-400d-8cbc-4dd4a25bebc5	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	76.00	19.30	\N	5.74	29.00	50.00	218.00	\N	2026-06-15 11:49:05.196
d99f5992-e8d2-4beb-b941-11e06fab5f19	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	79.00	24.00	\N	6.90	41.00	43.00	241.00	\N	2026-06-15 11:49:05.212
78e26954-ce17-4730-9755-ef27c25a78f8	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	66.00	19.60	\N	7.20	40.00	45.00	182.00	\N	2026-06-15 11:49:05.226
f5f895c5-7271-4086-836f-3cbc11ae9b11	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	49.00	27.00	\N	6.21	27.00	22.00	167.00	\N	2026-06-15 11:49:05.24
569e64d1-1508-4638-a094-d07e51a7fc77	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	71.00	19.70	\N	6.37	69.00	41.00	248.00	\N	2026-06-15 11:49:05.252
2e61b16a-9c95-4059-8d94-508dff25afa3	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	77.00	19.90	\N	6.33	43.00	28.00	221.00	\N	2026-06-15 11:49:05.265
a1a1e9aa-8451-4e07-acfb-0e441030029a	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	54.00	24.00	\N	6.70	57.00	27.00	240.00	\N	2026-06-15 11:49:05.279
3cb57717-3f8f-41c7-a701-24e2e2903724	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	50.00	18.20	\N	6.38	60.00	49.00	194.00	\N	2026-06-15 11:49:05.292
46f9136d-1494-4c7c-9439-a57b73bca350	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	49.00	19.50	\N	6.97	36.00	42.00	171.00	\N	2026-06-15 11:49:05.306
7a4d31f9-b093-42cf-a7fe-9ac2c12d3bdf	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	63.00	26.00	\N	5.83	32.00	16.00	130.00	\N	2026-06-15 11:49:05.319
cbfc7029-c580-4e89-9559-1bb8f260e817	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	54.00	19.10	\N	7.46	54.00	45.00	151.00	\N	2026-06-15 11:49:05.331
4d8b9ba2-a45d-4f2c-a71c-32501421678f	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	57.00	25.10	\N	6.20	50.00	30.00	224.00	\N	2026-06-15 11:49:05.344
55c5774d-9471-4338-b230-a2e41fc0c497	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	48.00	23.40	\N	6.76	55.00	38.00	176.00	\N	2026-06-15 11:49:05.356
9eac926c-94d4-4bbc-8100-855e6ecf763d	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	46.00	22.60	\N	6.07	73.00	17.00	138.00	\N	2026-06-15 11:49:05.371
10bf967b-06af-4d6c-9bec-3fdb5084cfa3	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	60.00	25.40	\N	6.27	33.00	24.00	236.00	\N	2026-06-15 11:49:05.387
4e1fa354-8492-41a3-8592-85acb3c08340	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	72.00	19.80	\N	7.17	26.00	32.00	236.00	\N	2026-06-15 11:59:54.268
edaf57e8-f248-4402-a59f-d0186ae79b9f	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	71.00	22.30	\N	5.86	51.00	39.00	215.00	\N	2026-06-15 11:59:54.406
8062ee3a-7f38-471b-88f1-ed9eacaa2dae	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	48.00	24.80	\N	7.45	51.00	35.00	139.00	\N	2026-06-15 11:59:54.438
ff23c498-ce88-4ffe-b37c-e015d0cec248	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	59.00	22.30	\N	7.46	53.00	42.00	140.00	\N	2026-06-15 11:59:54.465
32d8a1f8-5857-4d55-bc45-66ab26b4525b	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	45.00	23.20	\N	6.45	41.00	14.00	206.00	\N	2026-06-15 11:59:54.483
dc2b9a0c-a4a2-44c1-a079-5ba87b347675	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	59.00	22.20	\N	7.35	71.00	25.00	185.00	\N	2026-06-15 11:59:54.508
b045007f-d7bd-4064-a9e6-f7452cd12280	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	70.00	22.00	\N	6.65	39.00	41.00	108.00	\N	2026-06-15 11:59:54.553
bf245c2d-826d-46fa-a401-ad9b69b6ad37	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	70.00	22.60	\N	7.20	39.00	12.00	147.00	\N	2026-06-15 11:59:54.576
e4de90d3-05eb-4857-8503-0b2790f78c79	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	54.00	26.80	\N	7.43	52.00	25.00	249.00	\N	2026-06-15 11:59:54.6
7ec90c1e-2bd2-4289-8929-4b1a00847cf1	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	53.00	27.20	\N	5.95	45.00	21.00	208.00	\N	2026-06-15 11:59:54.637
22ac5e3a-5d93-4830-bc4c-ceca7bd89a2d	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	74.00	24.60	\N	5.76	67.00	34.00	142.00	\N	2026-06-15 11:59:54.656
3496bce1-96cd-4d1d-a4b5-5fc8bd8a1c6f	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	68.00	20.50	\N	5.73	63.00	12.00	174.00	\N	2026-06-15 11:59:54.69
bd76fab1-6ea4-4ee3-9fbb-53ded48d31ed	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	66.00	18.10	\N	5.51	63.00	10.00	222.00	\N	2026-06-15 11:59:54.707
776549d6-45dd-4e3e-b786-cb3f0f23749e	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	63.00	25.20	\N	6.81	52.00	23.00	133.00	\N	2026-06-15 11:59:54.742
a66d8457-a2ef-4d05-8ad3-c31dda72922e	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	70.00	23.80	\N	7.30	67.00	35.00	215.00	\N	2026-06-15 11:59:54.763
41725f7e-43e3-4486-9b69-11bce6e255fd	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	52.00	26.40	\N	6.45	59.00	15.00	144.00	\N	2026-06-15 11:59:54.778
f2331588-942b-42fe-b13c-3f7eb4233d42	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	50.00	19.60	\N	5.95	74.00	14.00	189.00	\N	2026-06-15 11:59:54.795
4e9211f9-5539-4374-a5a1-e5d047b3277c	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	47.00	23.00	\N	6.20	63.00	45.00	128.00	\N	2026-06-15 11:59:54.816
290fbe7e-0290-495c-bb4e-993256fef699	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	46.00	22.60	\N	5.87	57.00	27.00	143.00	\N	2026-06-15 11:59:54.842
1f675893-3da6-45cb-bb64-811973c8cc9e	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	75.00	21.10	\N	6.43	38.00	25.00	237.00	\N	2026-06-15 11:59:54.946
c9685a1a-01f5-494a-b83f-6f39d649bb69	3853f248-3e5e-457d-8277-e758f77ff307	dcda2652-8201-461b-b66c-199d46559b1a	54.00	27.20	\N	7.23	73.00	44.00	114.00	\N	2026-06-15 12:01:16.792
a12affdb-f2fd-4daa-8f67-65f29ade2c66	3bf2491b-df03-4ef1-a2d0-d4d479c9d100	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	76.00	21.60	\N	5.74	32.00	33.00	223.00	\N	2026-06-15 12:01:17.062
fcba43bc-243f-44fe-8a5b-8cce6cd7dcdf	c99fa658-54c9-40f1-86ab-62db13a819ae	f5fd961a-6846-45f7-b13d-b795bff19cec	65.00	20.60	\N	5.70	21.00	21.00	192.00	\N	2026-06-15 12:01:17.144
dfdbbab4-ac52-4a0b-909a-eaad51a4e570	0c78ed0b-8411-415e-bc69-8724e221dbb9	0af120c1-d4b7-4719-8102-1013b24681ff	47.00	18.20	\N	6.17	28.00	29.00	180.00	\N	2026-06-15 12:01:17.191
78f42d49-32fd-4778-9952-4d7561149a86	839998b1-8d64-4eb6-8aa8-6854426447eb	be27e8d0-183f-4058-93e3-b0b35fd2852d	67.00	21.10	\N	6.24	52.00	46.00	161.00	\N	2026-06-15 12:01:17.223
f4469583-9e87-4730-a897-5f2abc57edef	5f6988ef-cc2b-4f04-a7df-7d0544cb79d8	92f6e962-1503-48d8-bd40-96d357dc6858	46.00	25.10	\N	5.70	52.00	39.00	240.00	\N	2026-06-15 12:01:17.253
30eaa07e-3a7e-4b45-b996-718511d47bad	a31371d8-dab2-4ff2-bcee-153516ac8751	13ff9666-eff8-40ab-be5c-ab7566af2309	73.00	25.30	\N	6.64	20.00	38.00	102.00	\N	2026-06-15 12:01:17.31
110c27b8-099b-44e5-99db-63f5c34fae8a	cc3cd0e0-597f-4b2e-99f1-68ccaa90258f	11b8cdc7-10ad-4f98-b66a-430f0c630091	76.00	25.90	\N	5.80	76.00	50.00	243.00	\N	2026-06-15 12:01:17.359
c0b87c69-bc7e-4cea-87d4-398d1f11e96b	47630cf8-2c84-42de-80bd-2937c84b1c90	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	61.00	26.30	\N	7.12	33.00	14.00	123.00	\N	2026-06-15 12:01:17.397
26d31e2d-bef3-49fa-a609-71aac4d7493f	81d86fcd-e6c6-4b60-9305-d81635bf6616	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	76.00	20.00	\N	7.08	24.00	22.00	197.00	\N	2026-06-15 12:01:17.44
4f705e85-2c87-4a0e-9848-37df50c09036	1011aee0-084c-47f8-a6f8-91531937ab57	673e0225-61d4-4f83-a74d-ceb8a4d1f604	74.00	26.60	\N	6.59	39.00	14.00	204.00	\N	2026-06-15 12:01:17.483
c9539d59-e47b-4fd9-83f4-b9546ed292e9	c1fc375b-c83b-44c9-85fe-2f31836a62c9	a8be5879-af12-4128-a465-fa04876a8be7	63.00	23.20	\N	7.36	56.00	20.00	210.00	\N	2026-06-15 12:01:17.511
9809a2e4-b064-472f-b7c6-fbbf31aa86bf	4fdaeecc-0d08-4ce7-8eac-426784b97d56	a92ddbdd-684c-4d9e-9a69-728ca3e61339	45.00	20.10	\N	7.00	58.00	38.00	210.00	\N	2026-06-15 12:01:17.564
0594bca6-ea4a-4fe2-9ebc-6cd5f0e323e8	94241794-4d08-44e4-8b05-9233f5511ab8	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	70.00	18.10	\N	6.92	70.00	45.00	112.00	\N	2026-06-15 12:01:17.594
c6d404c7-90fb-4f8a-ad2e-f53c1eebc9f9	25fb4c03-c75f-4582-98e1-dc285a991e4b	958704ff-8558-48fc-98a2-4ef07e511d04	67.00	20.50	\N	6.11	50.00	48.00	159.00	\N	2026-06-15 12:01:17.655
2781eea5-7345-48cd-91f2-cecf4f56bf48	2d2d91a9-3f9b-410c-8840-392d74d7a641	d201582e-aa22-4517-bd65-fce9435b6ef9	64.00	20.70	\N	7.14	50.00	30.00	127.00	\N	2026-06-15 12:01:17.702
c151b9e5-ef21-4faf-aa6c-5e23154af32b	a1806da2-1107-4736-affd-dd8691f1d148	9c040a91-bde6-43da-9292-1d690e3412fb	71.00	24.30	\N	7.06	62.00	38.00	170.00	\N	2026-06-15 12:01:17.735
594bd729-8927-4df2-8c8c-61e0947f3f4a	b30f29c2-c55c-499a-a232-4a9b63de32f7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	45.00	21.20	\N	5.53	79.00	12.00	142.00	\N	2026-06-15 12:01:17.767
1dd566d4-67fb-4dcb-a253-2950b561b5d7	0c8313f0-701a-4279-b083-2ced2bc7cf88	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	57.00	23.70	\N	7.34	53.00	12.00	178.00	\N	2026-06-15 12:01:17.826
4d7b03ba-cd7c-4eb2-b1e2-254bbe2436c1	2c87e17f-b1b5-49c3-a7e5-39e7e54c12e5	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	79.00	27.00	\N	6.70	48.00	42.00	123.00	\N	2026-06-15 12:01:17.885
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
93aa853c-00be-4acd-a3ec-151c3f1a549b	api	healthy	5.00	35796	0	2026-06-15 11:59:01.188
bdf6b430-23f1-45ae-bb22-f16ca1d9e0b7	database	connected	100.00	0	0	2026-06-15 11:59:01.2
50b2f676-1603-459e-a28b-3b5c3985dbad	sensors	healthy	100.00	0	0	2026-06-15 11:59:01.203
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (key, value, description, "updatedAt") FROM stdin;
backup_schedule	{"enabled":false,"frequency":"daily","time":"02:00","retention":"7"}	\N	2026-06-15 11:51:55.577
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, phone, email, "fullName", "avatarUrl", "passwordHash", role, language, status, "isActive", "subscriptionType", "subscriptionExpiresAt", "hasSensorAccess", "serviceAccessExpiresAt", "hasMarketAccess", "isOnboarded", "isApproved", "requiresPasswordChange", province, district, sector, cell, village, "createdAt", "updatedAt", "deletedAt") FROM stdin;
00d4daa4-ead1-413a-9e43-bc07423fef4b	250780000001	superadmin@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	super_admin	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:23.39	2026-06-15 11:25:23.39	\N
303975c4-23e0-44ac-b267-8a118ad3aeea	250780000002	admin@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	admin	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:23.429	2026-06-15 11:25:23.429	\N
9c1b7161-64b4-436e-a08f-17ff9f0079e5	250780000003	officer1@aguka.rw	Umujyanama Mukamana	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	officer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:23.594	2026-06-15 11:25:23.594	\N
f08c3799-76cf-47ff-a789-991e34f9d86d	250780000004	officer2@aguka.rw	Eric Ndayisaba	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	officer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:23.632	2026-06-15 11:25:23.632	\N
2a364931-6efb-45fe-a4af-484440f20fc9	250788200001	manager.kinigi@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.561	2026-06-15 11:25:24.561	\N
af45d49f-dc0c-4251-b84d-4b6e03577d7c	250788200002	manager.rubavu@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.58	2026-06-15 11:25:24.58	\N
b0693c8a-162f-4393-8194-9e7a43713530	250788200003	manager.huye@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.592	2026-06-15 11:25:24.592	\N
5c98983f-f01c-4c55-b478-0da7339f87b8	250788200004	manager.bugesera@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.602	2026-06-15 11:25:24.602	\N
9b2f74f2-6b99-4799-acb6-786cdf46a9e7	250788200005	manager.kayonza@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.603	2026-06-15 11:25:24.603	\N
79d7bc71-5b5f-4fe9-8acc-b90365a9c90d	250788200006	manager.nyamasheke@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.608	2026-06-15 11:25:24.608	\N
ab3ee7e4-5912-4f65-ab2c-a327d54715c9	250788200007	manager.burera@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.61	2026-06-15 11:25:24.61	\N
8b31026e-9d04-4272-b30e-b5acd6bec14b	250788200008	manager.nyamagabe@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.612	2026-06-15 11:25:24.612	\N
914fb936-6720-482b-a6ee-32c68588d281	250788200009	manager.ruhango@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.615	2026-06-15 11:25:24.615	\N
d740ba34-c911-4f00-b594-a4792511bb1a	250788200010	manager.rulindo@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	cooperative	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.618	2026-06-15 11:25:24.618	\N
711fd94b-07c8-4123-b075-29b4ed37959b	250788300001	jean.habimana@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.854	2026-06-15 11:25:24.854	\N
bd0fe305-7694-40d0-9820-5c05f3eff708	250788300002	solange.uwimana@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.895	2026-06-15 11:25:24.895	\N
e6bef470-5799-4d5a-a467-11611cc1ae70	250788300003	celestin.bizimana@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.919	2026-06-15 11:25:24.919	\N
f38a8e24-63a1-4792-80f5-e7f6fb83739d	250788300004	claudine.mukand@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.941	2026-06-15 11:25:24.941	\N
086bc791-7769-472e-8f9d-73fb3f0cc068	250788300005	theophile.ntu@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.967	2026-06-15 11:25:24.967	\N
4e74f05d-7a6d-4765-864f-52a3d9e2037e	250788300006	immacule.uwera@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:24.991	2026-06-15 11:25:24.991	\N
bb5b4e4f-6f25-466a-950d-dc6ac956487f	250788300007	evariste.nzig@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.015	2026-06-15 11:25:25.015	\N
30ec83c7-61ed-49a5-adf4-862764c51141	250788300008	vestine.nkusi@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.036	2026-06-15 11:25:25.036	\N
e8217a49-4634-4f68-a88c-7c16461ed779	250788300009	patrice.mugabo@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.058	2026-06-15 11:25:25.058	\N
9dbf988e-40b2-480c-917f-5c05650f4ff7	250788300010	domitille.uwim@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.079	2026-06-15 11:25:25.079	\N
fadebf60-23da-4539-9bfa-f336b9b2415e	250788300011	alexis.mugenzi@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.099	2026-06-15 11:25:25.099	\N
5697322c-32dd-4c97-a349-da421a9cdcbd	250788300012	chantal.nkuru@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.119	2026-06-15 11:25:25.119	\N
ecc1a97a-efb1-4a2e-bfea-1a761d114ca6	250788300013	felix.rutageng@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.145	2026-06-15 11:25:25.145	\N
fc016103-b504-4195-95dd-fba1c0f0f1bb	250788300014	fidele.nshimi@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.168	2026-06-15 11:25:25.168	\N
e132efee-2135-4696-828b-0ff38c084fe7	250788300015	odette.ingab@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.195	2026-06-15 11:25:25.195	\N
edb9d045-a82d-4f20-b5e5-2a549128f323	250788300016	theogene.mug@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.217	2026-06-15 11:25:25.217	\N
3482b36c-b79c-4f23-b0c0-7fc3cd0358fa	250788300017	jeanpaul.hab@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.238	2026-06-15 11:25:25.238	\N
a3469761-e403-43b9-b87c-a5a77a7f0a6d	250788300018	yvonne.mutuy@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.261	2026-06-15 11:25:25.261	\N
2a9c84e6-30e0-4b25-b4b7-9f50f48d131b	250788300019	gabriel.niyonz@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	f	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.284	2026-06-15 11:25:25.284	\N
1652bdd2-357d-4534-a032-fdfe7e656864	250788300020	alice.nyira@aguka.rw	\N	\N	$argon2id$v=19$m=65536,t=3,p=4$i4cf2Opvmc76e9xXDvOgyw$ZFZ1w9bYiNev/vAGYoBxtifbdCjXpDMPdBlC3rcr+3c	farmer	kinyarwanda	active	t	free	\N	f	\N	f	t	t	f	\N	\N	\N	\N	\N	2026-06-15 11:25:25.308	2026-06-15 11:31:42.703	\N
\.


--
-- Data for Name: WeatherReading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WeatherReading" (id, "farmerId", "weatherStationId", "temperatureCelsius", "humidityPercent", "rainfallMm", "windSpeedKmh", "windDirection", "pressureHpa", "uvIndex", "solarRadiationWm2", forecast24hr, forecast7day, "readingAt") FROM stdin;
660839e0-2e8f-4627-9a3c-daed6db3163e	dcda2652-8201-461b-b66c-199d46559b1a	\N	20.00	52.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.581
9a8e2423-a894-46ba-9895-d64d82b5edd0	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	23.00	57.00	1.70	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.608
537ef235-6402-4431-99df-e5842197a7a7	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	26.00	62.00	3.40	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.629
e5bae715-62a3-4938-ba45-e6d0fd1f0022	0af120c1-d4b7-4719-8102-1013b24681ff	\N	29.00	67.00	5.10	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.645
ec78ad19-4787-497a-b987-85b41c17da43	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	32.00	72.00	6.80	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.663
ecf0f7ef-887b-4776-baab-909d0d01db21	92f6e962-1503-48d8-bd40-96d357dc6858	\N	22.00	77.00	8.50	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.679
57856c03-15bc-42d4-819d-480aead9af57	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	25.00	82.00	10.20	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.697
f999836c-db28-4bd8-8e8d-2763f8bd183e	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	28.00	53.00	11.90	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.714
cb10a401-1a90-40f6-a4f8-5c0072afbe5b	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	31.00	58.00	1.60	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.73
e2af9b48-7b81-4481-9851-1535cbb80bd5	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	21.00	63.00	3.30	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.744
85c7b504-3255-4e60-927a-94a77229a00d	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	24.00	68.00	5.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.758
ddaeecaa-f831-4321-92f5-536fbc8ba851	a8be5879-af12-4128-a465-fa04876a8be7	\N	27.00	73.00	6.70	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.778
a0d9fcd9-7acb-4cca-b67d-dd9a87b57bd8	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	30.00	78.00	8.40	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.795
592421a1-ddaf-4c39-9311-05fc75b0f9e5	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	20.00	83.00	10.10	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.808
52071a66-d97e-45e5-8ffb-dc6c513d9efe	958704ff-8558-48fc-98a2-4ef07e511d04	\N	23.00	54.00	11.80	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.825
d68e9d8f-01c3-467c-9f82-30ded0fb8ff8	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	26.00	59.00	1.50	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.848
377fd50a-0d54-465e-ac93-953af9d960ae	9c040a91-bde6-43da-9292-1d690e3412fb	\N	29.00	64.00	3.20	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.863
7c33e5eb-989d-4698-8d4c-9cb7fbf85439	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	32.00	69.00	4.90	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.879
f9730466-7b8f-45f5-b915-d6da07022ef9	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	22.00	74.00	6.60	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.895
114d6cd5-ce41-4d32-a8e0-c1bc6a5f53a2	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	25.00	79.00	8.30	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:25:25.908
9b260771-13c6-4c78-b4fa-aea2199506c3	dcda2652-8201-461b-b66c-199d46559b1a	\N	26.50	71.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.092
f74a48dd-a45e-434a-b6ac-031434b60273	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	26.90	51.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.11
75885ec3-64cb-46db-bf76-01a93f2e815c	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	21.10	55.00	3.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.123
5a2293b5-9581-4256-9885-5d3275002d36	0af120c1-d4b7-4719-8102-1013b24681ff	\N	26.30	71.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.136
b023ba47-b7d2-4c48-ba3b-d74a6ee3728e	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	24.50	67.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.149
f5ea0ffa-845c-4ecb-8f65-4709ea8112c8	92f6e962-1503-48d8-bd40-96d357dc6858	\N	23.80	65.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.163
7514c76e-41fc-4707-9676-fad93c9577f8	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	21.70	55.00	10.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.181
f31a7fc2-02b5-4fe8-b033-23032179e723	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	24.60	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.193
7b9f57c1-bf90-4bd0-9568-5df05c691aab	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	20.90	79.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.21
17e2b062-b7a4-489a-8e2a-69d761ddaa64	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	21.50	63.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.221
b138327e-ae29-48aa-a2c7-011ee8457f58	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	27.20	69.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.233
f9f62d47-7c76-4513-8341-f09fdf724e22	a8be5879-af12-4128-a465-fa04876a8be7	\N	27.70	60.00	10.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.246
c7938ea6-c828-432e-9af2-4f6b4d3cfb89	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	21.00	61.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.258
db056c12-d21e-47a9-8a03-d8b581ba4d82	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	24.10	54.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.27
020bedb2-643f-4316-8239-c785b5f3ba0c	958704ff-8558-48fc-98a2-4ef07e511d04	\N	25.80	57.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.281
3851bd87-abfb-4741-85a0-819057a12bc7	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	23.70	55.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.296
f55569ba-a93f-4d31-ae40-c1a167eacada	9c040a91-bde6-43da-9292-1d690e3412fb	\N	25.80	68.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.313
edf9c809-9506-4c2e-a760-c9475a38bd36	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	21.70	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.325
524f0d78-5242-4d6b-a079-1acb034ba57e	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	27.80	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.339
b1ac5d73-a1af-425c-b1d3-61f6b675bb13	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	25.90	51.00	8.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:34:05.353
66cd6fb6-88be-4f71-bceb-ddaafc5d3c81	dcda2652-8201-461b-b66c-199d46559b1a	\N	22.30	70.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.115
20a3d2ab-7221-46ad-a792-627684854eb7	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	21.90	64.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.135
01f8138b-f1e2-4782-8d97-8e08d8d758fa	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	21.50	67.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.15
4006e5f0-f601-4b28-b5b6-58a0396772dd	0af120c1-d4b7-4719-8102-1013b24681ff	\N	21.00	56.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.166
f17ea3ed-148b-4d1d-b885-bdbb9ea089bc	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	26.50	59.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.187
593cbfac-9bfd-4adc-9f66-fc5bfa528c21	92f6e962-1503-48d8-bd40-96d357dc6858	\N	22.00	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.202
b62c2dab-ea63-4bc8-a9f0-819c14318909	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	25.00	71.00	4.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.218
23e3bbcb-bb28-49ae-9ae5-1a8c6acb260e	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	24.50	63.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.231
1a4512c1-7229-47ed-9719-a76809f9fc34	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	21.20	56.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.246
426eceed-f549-4ce3-8711-d3266aa3ff89	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	27.00	70.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.258
7eb68c6f-2d9f-4a04-9cb2-2bf41b1b211c	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	25.10	76.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.271
26401a97-3933-4e3a-b83f-b51ce24cf8bd	a8be5879-af12-4128-a465-fa04876a8be7	\N	27.70	60.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.284
1d831f98-53cf-4750-bc1c-94aa63934308	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	24.80	76.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.297
c5afaf78-a66e-4d7f-996b-be75e011a77e	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	27.00	74.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.311
1e35fdaf-cea2-4d19-a5d0-6265fed41529	958704ff-8558-48fc-98a2-4ef07e511d04	\N	20.30	54.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.324
a3952526-142a-49d2-b693-11d554e59247	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	27.00	70.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.336
09015ed4-916d-4ddd-8196-5d4289efb34b	9c040a91-bde6-43da-9292-1d690e3412fb	\N	24.20	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.349
c8e142ba-a2a4-49b4-934d-783fe65838bf	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	23.50	56.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.361
a76e2280-ac91-4cad-baed-6a5209bea2cb	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	27.00	68.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.376
5c8d4be2-5f78-4eae-a58e-11338dd95e28	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	22.40	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:49:05.391
9b33bb20-198f-474c-ae89-006ba6cb7786	dcda2652-8201-461b-b66c-199d46559b1a	\N	20.30	50.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.361
eafac184-2345-4f9d-91d4-f267c2efb574	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	23.30	61.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.42
6e862da1-41bb-4385-840b-132525c49221	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	22.10	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.452
fd838278-803f-422e-b4ee-9bf0160fe737	0af120c1-d4b7-4719-8102-1013b24681ff	\N	24.10	68.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.472
81a6ada8-4db3-4a89-9ff5-65338006527c	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	22.10	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.496
b3226800-9df9-47db-a666-230df18e9bf2	92f6e962-1503-48d8-bd40-96d357dc6858	\N	24.40	59.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.541
830e7800-3b0f-43db-b9a0-1031874a523a	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	25.70	71.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.565
bb2d2b64-9ada-4870-91af-8aa592c876cd	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	22.40	64.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.582
ac4e0f2f-3edd-4315-b0e9-354b6542eeca	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	25.00	64.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.615
85268076-51c1-435b-a09c-3f6c87641bc8	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	23.60	64.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.642
3fca349a-6dd0-4949-80b3-18c021e9abfd	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	25.20	58.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.666
714378b6-ee8d-4135-b8db-771fd5c1b678	a8be5879-af12-4128-a465-fa04876a8be7	\N	24.50	66.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.7
d5d36367-53b0-4554-be88-9aac9a69894f	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	22.70	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.721
b470b167-56ff-4a16-92aa-3a2778000cf5	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	26.30	66.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.753
30b6ae07-0f90-4cd7-9157-fa2aa8304b25	958704ff-8558-48fc-98a2-4ef07e511d04	\N	24.00	63.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.77
c940134c-ba5b-4675-b256-c52d175ed4a0	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	21.40	59.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.786
07bb8547-15d2-444e-be75-ddc38556b636	9c040a91-bde6-43da-9292-1d690e3412fb	\N	20.70	66.00	9.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.8
41b2188f-b698-45b4-953b-d22f9edae0d7	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	24.50	62.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.833
b7b061ff-d4c4-4e03-b15f-cc04ac29eaf1	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	20.90	70.00	6.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.928
b7012231-b5ea-4c64-b982-8eaa259c2fda	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	23.90	66.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 11:59:54.956
513d14df-cc42-447c-97a9-829e233149dd	dcda2652-8201-461b-b66c-199d46559b1a	\N	20.80	69.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.024
f12f68dd-6774-41f7-8126-80d279ab3baf	e7fd4831-3f3e-4a9d-a4d3-bc841d173ad7	\N	22.50	50.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.095
88e44633-3f67-4f75-b54b-322208005103	f5fd961a-6846-45f7-b13d-b795bff19cec	\N	23.30	61.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.172
4d63a423-477a-4074-9137-d521212e35c0	0af120c1-d4b7-4719-8102-1013b24681ff	\N	26.60	54.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.205
e50108e1-3d69-42ca-bcf1-ed21f2132cee	be27e8d0-183f-4058-93e3-b0b35fd2852d	\N	20.70	74.00	2.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.232
c298c968-ae7b-4cf4-8604-339f0a376c2f	92f6e962-1503-48d8-bd40-96d357dc6858	\N	24.70	59.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.279
ae0f7e42-a06c-4d85-af57-e959b6f0e32d	13ff9666-eff8-40ab-be5c-ab7566af2309	\N	23.90	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.338
4d60d3e2-39be-420d-9852-127ded7647e0	11b8cdc7-10ad-4f98-b66a-430f0c630091	\N	24.50	77.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.365
e2a17bbe-964a-4b38-8ba2-96f017fb4460	cc6cb9b4-9b78-47fa-8408-7ac5d75f7276	\N	21.40	79.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.425
b7b135e4-db89-4b5d-a05d-7780004e603a	8d529770-72ac-46c1-a2ad-6e9ad01c6e27	\N	21.70	54.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.457
c7be307a-5a1a-433b-a1ad-7198ffb57367	673e0225-61d4-4f83-a74d-ceb8a4d1f604	\N	22.50	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.489
080235cd-994b-4986-939b-6e06450c194c	a8be5879-af12-4128-a465-fa04876a8be7	\N	21.10	53.00	9.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.53
e95b30e2-e0cc-4f84-a84d-2da18c80ad9e	a92ddbdd-684c-4d9e-9a69-728ca3e61339	\N	25.20	67.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.571
d0c4ebce-4ca5-4eb6-9b74-ec4f383d83ed	d29b9d8b-c7cb-4eea-98a5-ed1d118883f1	\N	25.20	68.00	3.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.618
e0049dd5-44fc-4d32-812c-b6c5d37a1838	958704ff-8558-48fc-98a2-4ef07e511d04	\N	23.90	72.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.669
fd4234df-23c9-412a-8970-895ffc203ef5	d201582e-aa22-4517-bd65-fce9435b6ef9	\N	25.70	66.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.727
e2bfb7d9-a3a4-4a96-ad73-6f2ed25cdc13	9c040a91-bde6-43da-9292-1d690e3412fb	\N	22.80	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.74
b2be761d-982d-46d6-a43d-617ed9d8104f	51b9775b-12f1-4b7f-84de-9277c32ae3e4	\N	24.90	68.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.79
cdef97a6-dd46-43d3-aa3e-f3ed23ef42e3	7ac1c8e1-4969-4a21-8dd0-3a7d55c3db1c	\N	21.80	71.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.849
ac542a8c-9ea3-4fe8-88e9-bc08216d3ef4	92d69ce0-d1b4-4e2a-9ec3-761a9e17afb1	\N	20.60	56.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-15 12:01:17.897
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, key, enabled, description, updated_by, updated_at) FROM stdin;
cmqf5hy5g00008k8r3lrfgun6	FARMER_MODULE	t	Farmer mobile app module	\N	2026-06-15 11:49:38.98
cmqf5hy6r00018k8r6bc5acj3	EXTENSION_MODULE	t	Extension officer module	\N	2026-06-15 11:49:39.027
cmqf5hy7000028k8rzymlukzs	COOPERATIVE_MODULE	t	Cooperative management module	\N	2026-06-15 11:49:39.036
cmqf5hy7500038k8rg3ogh8fd	ADMIN_MODULE	t	Administration panel	\N	2026-06-15 11:49:39.042
cmqf5hy7e00048k8ruturj6su	AI_RECOMMENDATIONS	t	AI-powered farming recommendations	\N	2026-06-15 11:49:39.05
cmqf5hy7l00058k8ri48ctotb	COMMUNITY_MODULE	t	Community forum and posts	\N	2026-06-15 11:49:39.057
cmqf5hy8l00068k8rg206ybgw	REPORTS_MODULE	t	Reports and analytics	\N	2026-06-15 11:49:39.093
cmqf5hy8v00078k8rewb1lc00	NOTIFICATIONS_MODULE	t	Push/SMS notifications	\N	2026-06-15 11:49:39.103
cmqf5hy9400088k8rpm396kl0	LIVESTOCK_GUIDANCE	t	Livestock management guidance	\N	2026-06-15 11:49:39.112
cmqf5hy9d00098k8r7cquyujd	CROP_GUIDANCE	t	Crop management guidance	\N	2026-06-15 11:49:39.121
\.


--
-- Data for Name: password_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_histories (id, user_id, password_hash, created_at) FROM stdin;
\.


--
-- Data for Name: security_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.security_policies (id, policy_type, config, updated_by, updated_at) FROM stdin;
cmqf5n8lq000a8k8rl9622rjh	PASSWORD_POLICY	{"minLength": 10, "expiryDays": 90, "preventReuse": 3, "requireNumbers": true, "requireSpecial": true, "requireLowercase": true, "requireUppercase": true}	00d4daa4-ead1-413a-9e43-bc07423fef4b	2026-06-15 12:00:15.263
\.


--
-- Data for Name: user_merge_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_merge_logs (id, primary_user_id, secondary_user_id, merged_data, merged_by, merged_at) FROM stdin;
\.


--
-- Name: AdvisoryTemplate AdvisoryTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdvisoryTemplate"
    ADD CONSTRAINT "AdvisoryTemplate_pkey" PRIMARY KEY (id);


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
-- Name: CooperativeExpense CooperativeExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeExpense"
    ADD CONSTRAINT "CooperativeExpense_pkey" PRIMARY KEY (id);


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
-- Name: EventAttendee EventAttendee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventAttendee"
    ADD CONSTRAINT "EventAttendee_pkey" PRIMARY KEY (id);


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
-- Name: FarmerFiles FarmerFiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerFiles"
    ADD CONSTRAINT "FarmerFiles_pkey" PRIMARY KEY (id);


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
-- Name: FieldVisitNote FieldVisitNote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FieldVisitNote"
    ADD CONSTRAINT "FieldVisitNote_pkey" PRIMARY KEY (id);


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
-- Name: Guide Guide_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guide"
    ADD CONSTRAINT "Guide_pkey" PRIMARY KEY (id);


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
-- Name: MemberDue MemberDue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberDue"
    ADD CONSTRAINT "MemberDue_pkey" PRIMARY KEY (id);


--
-- Name: MemberRequest MemberRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberRequest"
    ADD CONSTRAINT "MemberRequest_pkey" PRIMARY KEY (id);


--
-- Name: NotificationDelivery NotificationDelivery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationDelivery"
    ADD CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY (id);


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
-- Name: PostLike PostLike_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_pkey" PRIMARY KEY (id);


--
-- Name: PostReport PostReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostReport"
    ADD CONSTRAINT "PostReport_pkey" PRIMARY KEY (id);


--
-- Name: PostView PostView_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostView"
    ADD CONSTRAINT "PostView_pkey" PRIMARY KEY (id);


--
-- Name: PriceAlert PriceAlert_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PriceAlert"
    ADD CONSTRAINT "PriceAlert_pkey" PRIMARY KEY (id);


--
-- Name: RecommendationRule RecommendationRule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RecommendationRule"
    ADD CONSTRAINT "RecommendationRule_pkey" PRIMARY KEY (id);


--
-- Name: Recommendation Recommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_pkey" PRIMARY KEY (id);


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
-- Name: Season Season_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Season"
    ADD CONSTRAINT "Season_pkey" PRIMARY KEY (id);


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
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: password_histories password_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_histories
    ADD CONSTRAINT password_histories_pkey PRIMARY KEY (id);


--
-- Name: security_policies security_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_policies
    ADD CONSTRAINT security_policies_pkey PRIMARY KEY (id);


--
-- Name: user_merge_logs user_merge_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_merge_logs
    ADD CONSTRAINT user_merge_logs_pkey PRIMARY KEY (id);


--
-- Name: AdvisoryTemplate_officerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AdvisoryTemplate_officerId_idx" ON public."AdvisoryTemplate" USING btree ("officerId");


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
-- Name: CooperativeExpense_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeExpense_category_idx" ON public."CooperativeExpense" USING btree (category);


--
-- Name: CooperativeExpense_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeExpense_cooperativeId_idx" ON public."CooperativeExpense" USING btree ("cooperativeId");


--
-- Name: CooperativeExpense_expenseDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeExpense_expenseDate_idx" ON public."CooperativeExpense" USING btree ("expenseDate");


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
-- Name: CooperativeProfile_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CooperativeProfile_deletedAt_idx" ON public."CooperativeProfile" USING btree ("deletedAt");


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
-- Name: Cooperative_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cooperative_deletedAt_idx" ON public."Cooperative" USING btree ("deletedAt");


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
-- Name: Crop_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Crop_deletedAt_idx" ON public."Crop" USING btree ("deletedAt");


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
-- Name: EventAttendee_activityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EventAttendee_activityId_idx" ON public."EventAttendee" USING btree ("activityId");


--
-- Name: EventAttendee_activityId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EventAttendee_activityId_userId_key" ON public."EventAttendee" USING btree ("activityId", "userId");


--
-- Name: ExtensionOfficerAssignment_extensionOfficerId_farmerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ExtensionOfficerAssignment_extensionOfficerId_farmerId_key" ON public."ExtensionOfficerAssignment" USING btree ("extensionOfficerId", "farmerId");


--
-- Name: ExtensionOfficerProfile_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ExtensionOfficerProfile_deletedAt_idx" ON public."ExtensionOfficerProfile" USING btree ("deletedAt");


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
-- Name: FarmerFiles_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerFiles_farmerId_idx" ON public."FarmerFiles" USING btree ("farmerId");


--
-- Name: FarmerFiles_fileType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerFiles_fileType_idx" ON public."FarmerFiles" USING btree ("fileType");


--
-- Name: FarmerProfile_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerProfile_cooperativeId_idx" ON public."FarmerProfile" USING btree ("cooperativeId");


--
-- Name: FarmerProfile_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FarmerProfile_deletedAt_idx" ON public."FarmerProfile" USING btree ("deletedAt");


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
-- Name: FieldVisitNote_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FieldVisitNote_farmerId_idx" ON public."FieldVisitNote" USING btree ("farmerId");


--
-- Name: FieldVisitNote_officerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FieldVisitNote_officerId_idx" ON public."FieldVisitNote" USING btree ("officerId");


--
-- Name: ForumComment_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumComment_authorId_idx" ON public."ForumComment" USING btree ("authorId");


--
-- Name: ForumComment_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumComment_postId_idx" ON public."ForumComment" USING btree ("postId");


--
-- Name: ForumPost_audienceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_audienceType_idx" ON public."ForumPost" USING btree ("audienceType");


--
-- Name: ForumPost_authorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_authorId_idx" ON public."ForumPost" USING btree ("authorId");


--
-- Name: ForumPost_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_cooperativeId_idx" ON public."ForumPost" USING btree ("cooperativeId");


--
-- Name: ForumPost_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_status_idx" ON public."ForumPost" USING btree (status);


--
-- Name: ForumPost_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ForumPost_type_idx" ON public."ForumPost" USING btree (type);


--
-- Name: GroupMessage_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GroupMessage_cooperativeId_idx" ON public."GroupMessage" USING btree ("cooperativeId");


--
-- Name: GroupMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GroupMessage_createdAt_idx" ON public."GroupMessage" USING btree ("createdAt");


--
-- Name: Guide_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_category_idx" ON public."Guide" USING btree (category);


--
-- Name: Guide_crop_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_crop_idx" ON public."Guide" USING btree (crop);


--
-- Name: Guide_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_isActive_idx" ON public."Guide" USING btree ("isActive");


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
-- Name: MemberDue_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MemberDue_cooperativeId_idx" ON public."MemberDue" USING btree ("cooperativeId");


--
-- Name: MemberDue_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MemberDue_dueDate_idx" ON public."MemberDue" USING btree ("dueDate");


--
-- Name: MemberDue_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MemberDue_status_idx" ON public."MemberDue" USING btree (status);


--
-- Name: MemberRequest_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MemberRequest_cooperativeId_idx" ON public."MemberRequest" USING btree ("cooperativeId");


--
-- Name: MemberRequest_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MemberRequest_status_idx" ON public."MemberRequest" USING btree (status);


--
-- Name: MemberRequest_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MemberRequest_userId_key" ON public."MemberRequest" USING btree ("userId");


--
-- Name: NotificationDelivery_notificationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationDelivery_notificationId_idx" ON public."NotificationDelivery" USING btree ("notificationId");


--
-- Name: NotificationRule_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationRule_type_idx" ON public."NotificationRule" USING btree (type);


--
-- Name: NotificationRule_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "NotificationRule_userId_idx" ON public."NotificationRule" USING btree ("userId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


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
-- Name: PostLike_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostLike_postId_idx" ON public."PostLike" USING btree ("postId");


--
-- Name: PostLike_postId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON public."PostLike" USING btree ("postId", "userId");


--
-- Name: PostReport_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostReport_postId_idx" ON public."PostReport" USING btree ("postId");


--
-- Name: PostReport_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostReport_userId_idx" ON public."PostReport" USING btree ("userId");


--
-- Name: PostView_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostView_postId_idx" ON public."PostView" USING btree ("postId");


--
-- Name: PostView_postId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PostView_postId_userId_key" ON public."PostView" USING btree ("postId", "userId");


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
-- Name: RecommendationRule_enabled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RecommendationRule_enabled_idx" ON public."RecommendationRule" USING btree (enabled);


--
-- Name: RecommendationRule_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RecommendationRule_type_idx" ON public."RecommendationRule" USING btree (type);


--
-- Name: Recommendation_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Recommendation_farmerId_idx" ON public."Recommendation" USING btree ("farmerId");


--
-- Name: Recommendation_generatedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Recommendation_generatedAt_idx" ON public."Recommendation" USING btree ("generatedAt");


--
-- Name: Recommendation_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Recommendation_isRead_idx" ON public."Recommendation" USING btree ("isRead");


--
-- Name: Recommendation_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Recommendation_type_idx" ON public."Recommendation" USING btree (type);


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
-- Name: Report_generatedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_generatedById_idx" ON public."Report" USING btree ("generatedById");


--
-- Name: Report_reportType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Report_reportType_idx" ON public."Report" USING btree ("reportType");


--
-- Name: ResourceBooking_deliveryStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceBooking_deliveryStatus_idx" ON public."ResourceBooking" USING btree ("deliveryStatus");


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
-- Name: Season_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Season_isActive_idx" ON public."Season" USING btree ("isActive");


--
-- Name: Season_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Season_name_key" ON public."Season" USING btree (name);


--
-- Name: Sensor_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sensor_deletedAt_idx" ON public."Sensor" USING btree ("deletedAt");


--
-- Name: Sensor_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sensor_farmerId_idx" ON public."Sensor" USING btree ("farmerId");


--
-- Name: Sensor_serialNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sensor_serialNumber_key" ON public."Sensor" USING btree ("serialNumber");


--
-- Name: Session_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_createdAt_idx" ON public."Session" USING btree ("createdAt");


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
-- Name: SoilReading_sensorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SoilReading_sensorId_idx" ON public."SoilReading" USING btree ("sensorId");


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
-- Name: User_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_deletedAt_idx" ON public."User" USING btree ("deletedAt");


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
-- Name: feature_flags_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX feature_flags_key_key ON public.feature_flags USING btree (key);


--
-- Name: password_histories_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_histories_user_id_idx ON public.password_histories USING btree (user_id);


--
-- Name: security_policies_policy_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX security_policies_policy_type_key ON public.security_policies USING btree (policy_type);


--
-- Name: AdvisoryTemplate AdvisoryTemplate_officerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdvisoryTemplate"
    ADD CONSTRAINT "AdvisoryTemplate_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: CooperativeExpense CooperativeExpense_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CooperativeExpense"
    ADD CONSTRAINT "CooperativeExpense_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: EventAttendee EventAttendee_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventAttendee"
    ADD CONSTRAINT "EventAttendee_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public."CooperativeActivity"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: FarmerFiles FarmerFiles_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FarmerFiles"
    ADD CONSTRAINT "FarmerFiles_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: FieldVisitNote FieldVisitNote_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FieldVisitNote"
    ADD CONSTRAINT "FieldVisitNote_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FieldVisitNote FieldVisitNote_officerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FieldVisitNote"
    ADD CONSTRAINT "FieldVisitNote_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ForumComment ForumComment_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumComment"
    ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ForumPost ForumPost_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ForumPost"
    ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: MemberDue MemberDue_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberDue"
    ADD CONSTRAINT "MemberDue_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MemberRequest MemberRequest_cooperativeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MemberRequest"
    ADD CONSTRAINT "MemberRequest_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES public."Cooperative"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationDelivery NotificationDelivery_notificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NotificationDelivery"
    ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES public."Notification"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: PostLike PostLike_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostLike PostLike_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostLike"
    ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostReport PostReport_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostReport"
    ADD CONSTRAINT "PostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostReport PostReport_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostReport"
    ADD CONSTRAINT "PostReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostView PostView_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostView"
    ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."ForumPost"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostView PostView_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostView"
    ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Recommendation Recommendation_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recommendation"
    ADD CONSTRAINT "Recommendation_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
    ADD CONSTRAINT "Report_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Report Report_generatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

