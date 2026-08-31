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
    "verificationStatus" text DEFAULT 'pending'::text NOT NULL,
    "verifiedBy" text,
    "verifiedAt" timestamp(3) without time zone,
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
    content text NOT NULL,
    "parentCommentId" text,
    "likesCount" integer DEFAULT 0 NOT NULL,
    "isAcceptedAnswer" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "authorId" text NOT NULL
);


ALTER TABLE public."ForumComment" OWNER TO postgres;

--
-- Name: ForumPost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ForumPost" (
    id text NOT NULL,
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "attachmentUrls" text[],
    "audienceId" text,
    "audienceType" public."PostAudience" DEFAULT 'GLOBAL'::public."PostAudience" NOT NULL,
    "authorId" text NOT NULL,
    "isKnowledgeBase" boolean DEFAULT false NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    status public."PostStatus" DEFAULT 'active'::public."PostStatus" NOT NULL,
    type public."PostType" DEFAULT 'COMMUNITY_POST'::public."PostType" NOT NULL,
    "videoUrls" text[],
    "viewsCount" integer DEFAULT 0 NOT NULL
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
    channel text DEFAULT 'app'::text NOT NULL,
    "sentAt" timestamp(3) without time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    priority text DEFAULT 'normal'::text NOT NULL,
    type text DEFAULT 'system'::text NOT NULL
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
    quantity numeric(10,2),
    unit text,
    "availableQuantity" numeric(10,2),
    condition text,
    location text,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "addedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text,
    "expiryDate" timestamp(3) without time zone,
    "lastMaintenance" timestamp(3) without time zone,
    "minStockLevel" numeric(10,2),
    "nextMaintenance" timestamp(3) without time zone,
    status text DEFAULT 'available'::text NOT NULL
);


ALTER TABLE public."Resource" OWNER TO postgres;

--
-- Name: ResourceDistribution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ResourceDistribution" (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "farmerId" text NOT NULL,
    "assignedById" text NOT NULL,
    quantity numeric(10,2),
    unit text,
    location text,
    status text DEFAULT 'distributed'::text NOT NULL,
    notes text,
    "distributedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "returnedAt" timestamp(3) without time zone,
    "expectedReturn" timestamp(3) without time zone
);


ALTER TABLE public."ResourceDistribution" OWNER TO postgres;

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
    "quietHoursEnd" text,
    "quietHoursStart" text,
    "requiresPasswordChange" boolean DEFAULT false NOT NULL,
    sector text,
    "serviceAccessExpiresAt" timestamp(3) without time zone,
    "subscriptionExpiresAt" timestamp(3) without time zone,
    "subscriptionType" text DEFAULT 'free'::text,
    village text
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

COPY public."Alert" (id, "farmerId", "alertType", severity, title, message, recommendation, "isRead", channel, "createdAt", "sentViaSms", "createdById") FROM stdin;
0ca4c196-bf2d-4bf6-88da-6493a6dc9655	1ee83493-6d3b-4af0-8043-a90c91ccec18	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.465	f	\N
eaa9de5c-c82e-4567-a81d-08032b275606	1ee83493-6d3b-4af0-8043-a90c91ccec18	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.465	f	\N
d168226d-3f96-4549-8b43-c49cf7b189c7	1ee83493-6d3b-4af0-8043-a90c91ccec18	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.465	f	\N
e3cbd991-9e95-44a4-bb12-0316a40ce1d7	a22b0898-d778-4359-afbd-c141f1715707	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.483	f	\N
f0bf6559-4a76-448f-9210-445310015f47	a22b0898-d778-4359-afbd-c141f1715707	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.483	f	\N
3703fd19-0612-4ab5-a3f6-70bbd1e34fe8	4e540a68-eb3d-4333-8823-8633ed91c38c	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.491	f	\N
3cfb4798-6333-48c4-8700-e570ff87a040	4e540a68-eb3d-4333-8823-8633ed91c38c	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.491	f	\N
f9472b6e-4173-4234-9d3f-a6bab3e92e16	4e540a68-eb3d-4333-8823-8633ed91c38c	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.491	f	\N
c08ab84d-6430-41c9-b94f-92d887053ca4	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.498	f	\N
d9307eb8-6226-4bfd-abb0-2c635d533c71	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.498	f	\N
eed8aae9-047d-4c09-a64e-a4333ee5c076	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.505	f	\N
b7c73d19-1965-4574-9755-ca2173a4e268	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.505	f	\N
586255da-ff97-4fe2-ba8e-7d49d24f5c1d	18246537-c9fb-41a4-b94f-89944fff9c43	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.51	f	\N
0bd4f8f7-51e2-4465-80a8-c80d067c78f2	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.517	f	\N
e12324a6-ea2e-470c-9567-eb4dd9f8a14d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.517	f	\N
5874f4cc-cc0c-4a85-adbe-d5fcc9da5f91	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.517	f	\N
e278293f-8dc7-446f-b8dc-948e3ea5fc32	8b12ccf0-99ce-438a-ae92-9b0b128c5730	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.524	f	\N
98d01bcd-cae5-4a49-8ea1-22460a40f3be	8b12ccf0-99ce-438a-ae92-9b0b128c5730	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.524	f	\N
7fd97cec-2c2b-4a0b-bd92-19bb655c616b	8b12ccf0-99ce-438a-ae92-9b0b128c5730	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.524	f	\N
4e1afaa9-e5d3-4a00-986d-2c374b04dea5	13065b12-d33e-4f5b-9200-772bea57226c	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.529	f	\N
b51ae9ab-69ad-4418-8b31-956b7d96c5ce	13065b12-d33e-4f5b-9200-772bea57226c	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.529	f	\N
db101e66-9ab5-46ba-9a71-160e67ef8793	53953eec-9a9d-4622-9e22-d21cfc2c5fac	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.536	f	\N
f9f994e9-b338-4e91-bf74-5674f7d4e59e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.536	f	\N
1e31b242-b026-4c6b-8569-3385355b7e0d	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.545	f	\N
20f81560-d923-464c-8376-3863adf56d11	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.545	f	\N
ed16087a-5434-4dd1-b46b-59e276eb8537	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.545	f	\N
818dd46f-cbf2-48c6-b2a9-aabcd4c65b1b	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.551	f	\N
4e180e74-7bcb-4880-bb07-9afaade22267	e36eab12-7f32-49ed-b873-6e12ed6989d5	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.557	f	\N
6fd1eb12-942e-4809-b77d-e2596fabd612	e36eab12-7f32-49ed-b873-6e12ed6989d5	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.557	f	\N
212c38a1-3378-416c-8fa0-2fa478b6b6a6	e36eab12-7f32-49ed-b873-6e12ed6989d5	pest	info	Pest Risk Elevated	Fall armyworm risk is high this season.	Inspect crops and apply approved pesticide.	f	app	2026-06-22 09:28:43.557	f	\N
82013c50-9f87-453e-be0b-484940f55689	a3b683e1-9442-4f93-b0b9-4832d347c431	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.564	f	\N
42fe5294-0b43-4309-9240-ab2f3dd49ecf	a3b683e1-9442-4f93-b0b9-4832d347c431	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.564	f	\N
7538283b-4b0f-4ec4-b385-bbb8835ca63e	9278c158-e722-496e-9ed2-bdd86b0b6500	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.57	f	\N
fc255e5f-e78a-4eaf-b5fe-a6c4b21b2863	511325ec-4b9c-42a6-b67e-60ea0ed2db00	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.574	f	\N
4d8f4b59-e908-4ca0-ae2d-2eac1a58c2c0	18d19df2-74c7-41f9-9bb8-26cce623f714	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.581	f	\N
5a7726da-ba4d-4d7d-b250-65b98cbef0f7	ab9d4f3d-0948-4c99-b527-3274308c6778	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.587	f	\N
18a45db4-2b68-412b-a079-1aead4a836b7	ab9d4f3d-0948-4c99-b527-3274308c6778	weather	critical	Heavy Rain Warning	Heavy rain expected in the region.	Ensure drainage is clear.	f	app	2026-06-22 09:28:43.587	f	\N
204f872b-39c3-427e-b4f2-9cf0cd0e6cba	8e0eaf5d-6919-4c79-bfad-593f6ce69101	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.595	f	\N
279244ba-26d2-4ecc-90e6-84c0598188e6	32263c67-6a11-4e1e-ad26-c508b80de3f6	soil	warning	Low Soil Moisture	Soil moisture is below 30% in main plot.	Start irrigation soon.	f	app	2026-06-22 09:28:43.601	f	\N
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
32b93572-f541-48c3-966c-d36d47f7bbfb	4ad72173-cf2f-4eb4-b82b-152bd06af352	LOGIN	AUTH	4ad72173-cf2f-4eb4-b82b-152bd06af352	null	\N	\N	\N	2026-06-22 12:51:28.868
074a806d-dd28-4fc4-a1e9-e3cef356775c	4ad72173-cf2f-4eb4-b82b-152bd06af352	LOGIN	AUTH	4ad72173-cf2f-4eb4-b82b-152bd06af352	null	\N	\N	\N	2026-06-22 12:55:57.784
10a90fbc-2cb9-4a53-8ad7-2daa83c12ee3	4ad72173-cf2f-4eb4-b82b-152bd06af352	LOGIN	AUTH	4ad72173-cf2f-4eb4-b82b-152bd06af352	null	\N	\N	\N	2026-06-22 13:17:40.162
\.


--
-- Data for Name: Backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Backup" (id, name, type, status, "sizeBytes", "filePath", "createdBy", "createdAt", "completedAt", "restoredAt") FROM stdin;
58ee97e6-bfc9-48eb-882f-6c2f78be925b	aguka_backup_2026-06-22T13-18-45-622Z.sql	MANUAL	IN_PROGRESS	\N	F:\\Aguka Smart Framing Kit\\aguka-backend\\backups\\aguka_backup_2026-06-22T13-18-45-622Z.sql	4ad72173-cf2f-4eb4-b82b-152bd06af352	2026-06-22 13:18:45.624	\N	\N
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
96113786-9853-40a6-83f7-27b3d0750553	Abunzubumwe Cooperative	COOP/2024/001	Musanze	Kinigi	250788123001	kinigi.coop@gmail.com	Supporting potato and maize farmers in the Kinigi volcanic region.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	Iterambere Farmers Coop	COOP/2024/002	Rubavu	Gisenyi	250788123002	iterambere.rubavu@gmail.com	Coffee and banana cooperative serving western province farmers.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
7707179b-5295-4def-8c5f-5832a22845eb	Agakunze Horticulture Coop	COOP/2024/010	Rulindo	Base	250788123010	agakunze.rulindo@gmail.com	Vegetables, tomatoes and horticulture cooperative for urban markets.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
29b880ab-18ce-498c-882a-23acc69e184d	Duhingane Agricultural Coop	COOP/2024/003	Huye	Ngoma	250788123003	duhingane.huye@gmail.com	Bean and sorghum farming collective in the southern province.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
2f8d90e6-4a3e-4402-9838-aca3e72d3469	Ejo Heza Wheat Coop	COOP/2024/007	Burera	Rwerere	250788123007	ejoheza.burera@gmail.com	Wheat and Irish potato cooperative operating in highland areas.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	Twisungane Banana Coop	COOP/2024/009	Ruhango	Kinazi	250788123009	twisungane.ruhango@gmail.com	Banana farming and juice processing cooperative.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
ba35c499-df6a-4a50-87d8-ec90ed0532f0	Amahoro Coffee Cooperative	COOP/2024/008	Nyamagabe	Gasaka	250788123008	amahoro.coffee@gmail.com	Specialty coffee cooperative exporting washed Arabica.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
5ae0ec04-591e-4049-a50d-8f7000cc7535	Ubumwe Tea Cooperative	COOP/2024/006	Nyamasheke	Kagano	250788123006	ubumwe.tea@gmail.com	Tea cultivation and processing cooperative near Lake Kivu.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
eb77e4b2-0772-4081-92b3-975c3001ce66	Intwari Agri Cooperative	COOP/2024/005	Kayonza	Kabarondo	250788123005	intwari.kayonza@gmail.com	Cassava and maize cooperative promoting food security in Eastern province.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
77e18590-773b-4342-869c-8b24aaf6ae5f	Tuzamurane Rice Cooperative	COOP/2024/004	Bugesera	Nyamata	250788123004	tuzamurane.bugesera@gmail.com	Specialised in irrigated rice farming in the Nyamata marshlands.	t	2026-06-22 09:28:41.688	2026-06-22 09:28:41.688	\N
\.


--
-- Data for Name: CooperativeActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CooperativeActivity" (id, "cooperativeId", title, description, "activityType", status, "scheduledAt", location, "expectedParticipants", "actualParticipants", "organizerId", "createdAt", "updatedAt") FROM stdin;
0af0df1d-aad9-49c3-83fd-e66d1b7a0008	96113786-9853-40a6-83f7-27b3d0750553	Post-harvest Handling Training	\N	training	scheduled	2026-06-23 09:28:41.905	Musanze - Kinigi Coop Office	30	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
ecbb1248-1637-4244-a34e-45a4f9f3e88e	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	Irrigation Best Practices Workshop	\N	training	scheduled	2026-06-24 09:28:41.906	Rubavu - Gisenyi Coop Office	35	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
a997ed68-f617-4037-b476-04645400e8d7	29b880ab-18ce-498c-882a-23acc69e184d	Market Linkage Forum	\N	meeting	scheduled	2026-06-25 09:28:41.906	Huye - Ngoma Coop Office	40	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
23a2c28c-a15f-447c-9808-270159f093db	eb77e4b2-0772-4081-92b3-975c3001ce66	Pest & Disease Management	\N	training	scheduled	2026-06-27 09:28:41.906	Kayonza - Kabarondo Coop Office	50	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
48e885f7-4def-42e8-a7e2-55058b22e6d4	77e18590-773b-4342-869c-8b24aaf6ae5f	Soil Health Seminar	\N	training	scheduled	2026-06-26 09:28:41.906	Bugesera - Nyamata Coop Office	45	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
815a2a17-1c3c-45fc-a97e-58c4ecd76ca1	5ae0ec04-591e-4049-a50d-8f7000cc7535	Financial Literacy for Farmers	\N	training	scheduled	2026-06-28 09:28:41.906	Nyamasheke - Kagano Coop Office	55	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
7a572a7b-9bc9-45ad-b004-a4b52c5d1895	2f8d90e6-4a3e-4402-9838-aca3e72d3469	Export Standards Training	\N	training	scheduled	2026-06-29 09:28:41.906	Burera - Rwerere Coop Office	60	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
79d6dad4-4d10-42af-96b8-072f0fc0c1f4	ba35c499-df6a-4a50-87d8-ec90ed0532f0	Cooperative Governance Meeting	\N	meeting	scheduled	2026-06-30 09:28:41.906	Nyamagabe - Gasaka Coop Office	65	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
d01eb507-72af-43f2-8e7e-62f0dc1d50c1	e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	Agri-Input Subsidy Briefing	\N	meeting	scheduled	2026-07-01 09:28:41.906	Ruhango - Kinazi Coop Office	70	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
02d96eb1-7db0-4919-9153-0753977e3c5f	7707179b-5295-4def-8c5f-5832a22845eb	Climate Smart Agriculture Session	\N	training	scheduled	2026-07-02 09:28:41.907	Rulindo - Base Coop Office	75	\N	\N	2026-06-22 09:28:41.917	2026-06-22 09:28:41.917
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
f64ad49b-62c6-4b3e-bd14-7c03034207c3	0b179914-3579-43c2-98db-214d86a7fb9d	96113786-9853-40a6-83f7-27b3d0750553	manager	active	2026-06-22 09:28:41.732	\N
f5341931-fd1a-4ed2-83bf-2ae98723461c	be2db5ae-6b47-411b-a05b-1c65178b79a6	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	manager	active	2026-06-22 09:28:41.747	\N
2020ed05-ccbb-46e1-8fce-b13a7566e47c	eec58320-9999-4995-bdb6-7ab6ec7355ed	29b880ab-18ce-498c-882a-23acc69e184d	manager	active	2026-06-22 09:28:41.748	\N
dda8a991-64d8-4bcb-9e01-9a2d8ea02c6b	c4e54841-ed79-492b-ba8a-a79905af15c0	77e18590-773b-4342-869c-8b24aaf6ae5f	manager	active	2026-06-22 09:28:41.749	\N
1805810d-d828-402f-97fd-0b8a52ea6ea6	e86d1008-5e00-4fd8-b59c-0164ed59236e	eb77e4b2-0772-4081-92b3-975c3001ce66	manager	active	2026-06-22 09:28:41.75	\N
049d30a4-4ef3-452f-b04c-6456bde2ee6a	84408fed-0e60-410f-8012-42e6dc7b637b	5ae0ec04-591e-4049-a50d-8f7000cc7535	manager	active	2026-06-22 09:28:41.753	\N
afa84279-ecb0-45f5-96f3-1d7b4b6dee47	00e5003c-50c6-42a2-ba4b-60d56694abc7	2f8d90e6-4a3e-4402-9838-aca3e72d3469	manager	active	2026-06-22 09:28:41.754	\N
eca85124-e9bc-44aa-94a1-7e703cf2f94d	10a766c3-4472-4469-8953-972f4fe92f09	ba35c499-df6a-4a50-87d8-ec90ed0532f0	manager	active	2026-06-22 09:28:41.756	\N
6886a4cb-0602-4057-9345-b82c3514c228	aa1a9118-388f-42d0-abd0-0722f850b4bc	e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	manager	active	2026-06-22 09:28:41.758	\N
709a614f-b74b-42c5-99c9-8fd7bacc80a9	a2bf77a0-ae44-4ca5-924f-f812e19f36f3	7707179b-5295-4def-8c5f-5832a22845eb	manager	active	2026-06-22 09:28:41.76	\N
4654e8e5-5974-4cae-bc79-ae8d9609dd67	50e518eb-202f-40d2-aebe-9fccc78c1574	96113786-9853-40a6-83f7-27b3d0750553	member	active	2026-06-22 09:28:42.04	\N
511fe849-4210-488f-8d3f-b7ed1f20426a	dd2c95fa-b680-43dd-97c8-d6b4e2ee3ad6	96113786-9853-40a6-83f7-27b3d0750553	member	active	2026-06-22 09:28:42.064	\N
b9974462-c36f-4c91-9672-0f406cc4d5ed	9fd36cce-c67a-4ca6-9f13-42fac6040ba3	96113786-9853-40a6-83f7-27b3d0750553	member	active	2026-06-22 09:28:42.09	\N
460ba016-02ab-4a4d-b0e0-bd2e3483c89f	3178036f-6cc2-42a2-90eb-39e77f1d4948	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	member	active	2026-06-22 09:28:42.114	\N
a3434e11-edb5-4eae-82cb-700d55037388	44570b40-1306-48d3-9ad8-c7e35d6d1bb2	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	member	active	2026-06-22 09:28:42.139	\N
32ad72cd-f318-41c3-895f-a0045236a1a6	3c1d241f-8e44-4593-92c7-71c43bef6321	29b880ab-18ce-498c-882a-23acc69e184d	member	active	2026-06-22 09:28:42.163	\N
63148798-779f-4baf-86d7-56cccde4438c	029ce168-ede8-4570-ac71-53ec67f39c88	29b880ab-18ce-498c-882a-23acc69e184d	member	active	2026-06-22 09:28:42.183	\N
3154d64c-efc0-4203-9c72-98c05c12d61f	95119af2-ae90-48fb-bcd0-a763edc93fb9	77e18590-773b-4342-869c-8b24aaf6ae5f	member	active	2026-06-22 09:28:42.203	\N
f52a434e-9a67-45ac-ba06-a281719b42ad	f8d3d0f4-5b69-45a6-9db2-cc74e65422ac	77e18590-773b-4342-869c-8b24aaf6ae5f	member	active	2026-06-22 09:28:42.23	\N
c1c07018-4b6b-47dd-8847-ef8884b84b74	63a0964b-1e2c-4966-abeb-43032ad4ffaa	eb77e4b2-0772-4081-92b3-975c3001ce66	member	active	2026-06-22 09:28:42.251	\N
920b017f-b17a-47c3-b640-5575af147c62	7f287c02-3229-4b17-a27f-2e6a49bb3507	eb77e4b2-0772-4081-92b3-975c3001ce66	member	active	2026-06-22 09:28:42.27	\N
f712b035-73ec-4888-ba17-0971634e929c	70706fa6-97bb-4fc0-9394-46bc5adb42bf	5ae0ec04-591e-4049-a50d-8f7000cc7535	member	active	2026-06-22 09:28:42.291	\N
fe239fbb-72d9-492e-9b9d-315d55ba0320	02efc48d-6321-4825-b58c-f989211ac79f	5ae0ec04-591e-4049-a50d-8f7000cc7535	member	active	2026-06-22 09:28:42.315	\N
c8d7a7fe-ec28-4c4d-a8f4-44994d530150	43a7bb8a-4c05-432c-991a-5038aad70909	2f8d90e6-4a3e-4402-9838-aca3e72d3469	member	active	2026-06-22 09:28:42.337	\N
a5ca7a31-9832-439c-979e-cbd52dee65df	497693e3-4f8c-45a5-8ab8-729a55e6bddf	ba35c499-df6a-4a50-87d8-ec90ed0532f0	member	active	2026-06-22 09:28:42.355	\N
732807ed-187b-43d4-802c-3c7a219e8cbe	1edd5ee4-8d47-4db9-ae92-d3bbdd2296d2	ba35c499-df6a-4a50-87d8-ec90ed0532f0	member	active	2026-06-22 09:28:42.375	\N
d1d5e7ac-d430-496c-9e76-24d64590c9e0	cd460fd5-ba86-4951-88ee-3e344de3baf4	e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	member	active	2026-06-22 09:28:42.393	\N
2444468d-4d30-4df5-9e66-660542acc7ad	4fa4a9ac-cd16-4a35-ab3c-7478f39904d7	7707179b-5295-4def-8c5f-5832a22845eb	member	active	2026-06-22 09:28:42.417	\N
0a3729aa-81ea-4f9b-90cd-b1bf7ff98212	19670a70-2d65-43e3-923a-6da876390c95	7707179b-5295-4def-8c5f-5832a22845eb	member	active	2026-06-22 09:28:42.436	\N
f2ed2829-1a96-487d-9901-44e5a0a14e8b	208a4b6a-5544-4d1f-a332-36a2c2251a50	7707179b-5295-4def-8c5f-5832a22845eb	member	active	2026-06-22 09:28:42.453	\N
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
potato	Potato	Ibirayi	\N	Tuber	90	400.00	\N	\N	\N	5.00	6.50	\N	\N	\N	t	0.80	\N	30
coffee	Coffee	Ikawa	\N	Cash Crop	1095	800.00	\N	\N	\N	5.00	6.00	\N	\N	\N	t	0.80	\N	30
beans	Beans	Ibishyimbo	\N	Legume	75	300.00	\N	\N	\N	6.00	7.50	\N	\N	\N	t	0.80	\N	30
rice	Rice	Umuceri	\N	Cereal	150	1200.00	\N	\N	\N	5.00	6.50	\N	\N	\N	t	0.80	\N	30
wheat	Wheat	Ingano	\N	Cereal	110	450.00	\N	\N	\N	6.00	7.00	\N	\N	\N	t	0.80	\N	30
tea	Tea	Icyayi	\N	Cash Crop	1460	1200.00	\N	\N	\N	4.50	5.50	\N	\N	\N	t	0.80	\N	30
cassava	Cassava	Imyumbati	\N	Tuber	360	600.00	\N	\N	\N	4.50	7.00	\N	\N	\N	t	0.80	\N	30
banana	Banana	Igitoki	\N	Fruit	365	1000.00	\N	\N	\N	5.50	6.50	\N	\N	\N	t	0.80	\N	30
sorghum	Sorghum	Amasaka	\N	Cereal	130	350.00	\N	\N	\N	5.50	7.50	\N	\N	\N	t	0.80	\N	30
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
1f5d2b37-23fc-4f80-983e-dd937a516cf5	abb2f210-3dbc-4232-bde5-a9ed05c764ad	50e518eb-202f-40d2-aebe-9fccc78c1574	2026-06-22 09:28:42.468
84836286-47eb-4fa5-b013-97f47ea1d80e	abb2f210-3dbc-4232-bde5-a9ed05c764ad	dd2c95fa-b680-43dd-97c8-d6b4e2ee3ad6	2026-06-22 09:28:42.468
5f2bff84-c424-4f5b-a872-c5189f081737	abb2f210-3dbc-4232-bde5-a9ed05c764ad	9fd36cce-c67a-4ca6-9f13-42fac6040ba3	2026-06-22 09:28:42.468
ba98f004-29e4-4876-ab51-07df0cdcbd8f	abb2f210-3dbc-4232-bde5-a9ed05c764ad	3178036f-6cc2-42a2-90eb-39e77f1d4948	2026-06-22 09:28:42.468
a3044d54-8d6b-4315-ab99-19ee9840353b	abb2f210-3dbc-4232-bde5-a9ed05c764ad	44570b40-1306-48d3-9ad8-c7e35d6d1bb2	2026-06-22 09:28:42.468
2c1eefcd-a660-4878-b3ac-c21d96d9bf89	abb2f210-3dbc-4232-bde5-a9ed05c764ad	3c1d241f-8e44-4593-92c7-71c43bef6321	2026-06-22 09:28:42.468
e5603312-325a-4af8-b41b-cb3a422d07ec	abb2f210-3dbc-4232-bde5-a9ed05c764ad	029ce168-ede8-4570-ac71-53ec67f39c88	2026-06-22 09:28:42.468
c65c3a0f-39f3-46bf-9a1a-cd22ca77f752	abb2f210-3dbc-4232-bde5-a9ed05c764ad	95119af2-ae90-48fb-bcd0-a763edc93fb9	2026-06-22 09:28:42.468
da014ee4-2855-4dd4-918d-6c809d7cfc26	abb2f210-3dbc-4232-bde5-a9ed05c764ad	f8d3d0f4-5b69-45a6-9db2-cc74e65422ac	2026-06-22 09:28:42.468
f0a1f50b-5316-457c-9592-799d3b1377f9	abb2f210-3dbc-4232-bde5-a9ed05c764ad	63a0964b-1e2c-4966-abeb-43032ad4ffaa	2026-06-22 09:28:42.468
a9cc5e61-77a6-4517-b8be-a50040e5731d	8461c70a-3ec6-4969-b0e3-682b33d0efc4	7f287c02-3229-4b17-a27f-2e6a49bb3507	2026-06-22 09:28:42.468
ae92c7a8-33a8-4391-a4f7-e30fb3fe9fdf	8461c70a-3ec6-4969-b0e3-682b33d0efc4	70706fa6-97bb-4fc0-9394-46bc5adb42bf	2026-06-22 09:28:42.468
4b997ecb-a7e6-4f00-8549-03980aba4eae	8461c70a-3ec6-4969-b0e3-682b33d0efc4	02efc48d-6321-4825-b58c-f989211ac79f	2026-06-22 09:28:42.468
17f6a3ff-0241-48a9-a6e0-b7d5dcf10adc	8461c70a-3ec6-4969-b0e3-682b33d0efc4	43a7bb8a-4c05-432c-991a-5038aad70909	2026-06-22 09:28:42.468
e034d572-13dc-4901-81e2-32ae40e0d4fd	8461c70a-3ec6-4969-b0e3-682b33d0efc4	497693e3-4f8c-45a5-8ab8-729a55e6bddf	2026-06-22 09:28:42.468
0ac7ba39-4239-4873-8b7b-a10a9064209a	8461c70a-3ec6-4969-b0e3-682b33d0efc4	1edd5ee4-8d47-4db9-ae92-d3bbdd2296d2	2026-06-22 09:28:42.468
f55be3f6-c362-4f80-baf7-28d8a3bd4c66	8461c70a-3ec6-4969-b0e3-682b33d0efc4	cd460fd5-ba86-4951-88ee-3e344de3baf4	2026-06-22 09:28:42.468
a32a085a-d5a9-4862-9579-8b3fc0785653	8461c70a-3ec6-4969-b0e3-682b33d0efc4	4fa4a9ac-cd16-4a35-ab3c-7478f39904d7	2026-06-22 09:28:42.468
db12db26-65b1-42c4-9445-858accb0a1be	8461c70a-3ec6-4969-b0e3-682b33d0efc4	19670a70-2d65-43e3-923a-6da876390c95	2026-06-22 09:28:42.468
2719403e-0553-4466-a2d7-4fa8c4f9dd44	8461c70a-3ec6-4969-b0e3-682b33d0efc4	208a4b6a-5544-4d1f-a332-36a2c2251a50	2026-06-22 09:28:42.468
\.


--
-- Data for Name: ExtensionOfficerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ExtensionOfficerProfile" (id, "userId", "employeeId", organization, "badgePhotoUrl", specializations, "coveredSectors", "createdAt", "updatedAt", "deletedAt") FROM stdin;
95772821-f8b6-42f4-921a-ea44a263458e	abb2f210-3dbc-4232-bde5-a9ed05c764ad	OFF-001	Aguka Extension Services	\N	{"Soil health",Irrigation,"Pest management"}	{Kinigi,Gisenyi,Ngoma,Nyamata,Kabarondo}	2026-06-22 09:28:40.92	2026-06-22 09:28:40.92	\N
ea7a338c-2b5d-4b6c-b297-3e87bde26201	8461c70a-3ec6-4969-b0e3-682b33d0efc4	OFF-002	Aguka Extension Services	\N	{Coffee,Tea,"Climate smart agriculture"}	{Kagano,Rwerere,Gasaka,Kinazi,Base}	2026-06-22 09:28:40.944	2026-06-22 09:28:40.944	\N
\.


--
-- Data for Name: FarmActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmActivity" (id, "farmerId", "activityType", category, "cropId", quantity, unit, "costRwf", notes, "activityDate", "createdAt") FROM stdin;
c1bde63d-7b47-41bd-8c2e-3ca4561bb6d0	1ee83493-6d3b-4af0-8043-a90c91ccec18	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.302	2026-06-22 09:28:43.308
df404d6e-0ae5-4209-81be-b80e1ae34fbb	1ee83493-6d3b-4af0-8043-a90c91ccec18	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.302	2026-06-22 09:28:43.308
76aa09d6-6c83-4c4c-ba67-2aa3d66aa11b	1ee83493-6d3b-4af0-8043-a90c91ccec18	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.302	2026-06-22 09:28:43.308
6752533a-a9d4-47f7-9220-3520f5f8d369	a22b0898-d778-4359-afbd-c141f1715707	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.323	2026-06-22 09:28:43.327
95440edb-94c6-418c-a6a6-089651360230	a22b0898-d778-4359-afbd-c141f1715707	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.324	2026-06-22 09:28:43.327
246d2e63-fa4d-4d2c-8a5f-b614f5f8cea2	a22b0898-d778-4359-afbd-c141f1715707	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.324	2026-06-22 09:28:43.327
bb815897-7869-4156-b7c9-a8091bcbd1bc	4e540a68-eb3d-4333-8823-8633ed91c38c	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.333	2026-06-22 09:28:43.337
aa761a4d-7b07-4fec-863d-ba076755409d	4e540a68-eb3d-4333-8823-8633ed91c38c	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.333	2026-06-22 09:28:43.337
f12959a6-42bf-4aba-9ad8-4a1562418853	4e540a68-eb3d-4333-8823-8633ed91c38c	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.333	2026-06-22 09:28:43.337
ed1bc39a-238d-43e3-97aa-c3ddf4165699	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.34	2026-06-22 09:28:43.343
e0962eb0-ec0f-4a5c-b928-9fbc3a9fe990	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.34	2026-06-22 09:28:43.343
f3d2710d-68e6-48f0-9b1c-f040c41c7be4	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.34	2026-06-22 09:28:43.343
b4dbd9d7-f058-4757-bc70-84ae0f0be218	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.346	2026-06-22 09:28:43.349
f4b4084a-0320-48e6-8273-582ad4a07799	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.346	2026-06-22 09:28:43.349
a612d4dc-6cda-421c-b527-980a0ec6642f	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.346	2026-06-22 09:28:43.349
ca59f371-15db-4760-ab41-2cb1ff7f0419	18246537-c9fb-41a4-b94f-89944fff9c43	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.352	2026-06-22 09:28:43.355
0be9b7b7-4ae6-4bd1-a14c-a5fb7764b32a	18246537-c9fb-41a4-b94f-89944fff9c43	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.352	2026-06-22 09:28:43.355
b61c9634-1667-4a64-82a5-d85c006b4ee1	18246537-c9fb-41a4-b94f-89944fff9c43	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.352	2026-06-22 09:28:43.355
349fc463-d172-4603-a237-744e07af33b6	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.358	2026-06-22 09:28:43.362
5d83ecbb-a453-4f2d-8d21-12624d74266b	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.358	2026-06-22 09:28:43.362
4c99a77e-8f22-45fb-aa5d-fb1f10c335e6	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.358	2026-06-22 09:28:43.362
69d69a2d-2fca-4573-97ae-f20b73551873	8b12ccf0-99ce-438a-ae92-9b0b128c5730	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.366	2026-06-22 09:28:43.371
87eb2420-16de-402e-a061-e1f4657a1f3c	8b12ccf0-99ce-438a-ae92-9b0b128c5730	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.366	2026-06-22 09:28:43.371
5e99ea2c-9d8b-4b19-b829-a3502b0e1588	8b12ccf0-99ce-438a-ae92-9b0b128c5730	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.366	2026-06-22 09:28:43.371
2768efa5-c98a-42c6-a697-603a36137e6b	13065b12-d33e-4f5b-9200-772bea57226c	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.373	2026-06-22 09:28:43.377
fb0d86ab-7608-4372-9968-374e4dad06f0	13065b12-d33e-4f5b-9200-772bea57226c	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.373	2026-06-22 09:28:43.377
cd3b30b0-73fc-46d3-b75c-cced3ad63844	13065b12-d33e-4f5b-9200-772bea57226c	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.374	2026-06-22 09:28:43.377
c783d922-b824-492e-ad3a-eef6eee5c0b6	53953eec-9a9d-4622-9e22-d21cfc2c5fac	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.381	2026-06-22 09:28:43.384
84e67857-a694-4cda-b970-71cf7ebc555f	53953eec-9a9d-4622-9e22-d21cfc2c5fac	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.381	2026-06-22 09:28:43.384
e07f8836-066a-4c34-ae58-a7591400b6d4	53953eec-9a9d-4622-9e22-d21cfc2c5fac	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.381	2026-06-22 09:28:43.384
2d668da4-2498-409c-975c-889084da98ca	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.387	2026-06-22 09:28:43.39
1e42f2d2-b11d-418d-b03a-e62c3d342b9b	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.387	2026-06-22 09:28:43.39
68e5da1b-b334-4704-825c-01e89013d1f8	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.387	2026-06-22 09:28:43.39
2a174b33-6c56-4856-baf6-76a8f405539c	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.393	2026-06-22 09:28:43.396
3ee62c5f-e59f-4e40-9a82-4e5cbfcd0bd9	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.393	2026-06-22 09:28:43.396
b6b22ef6-7890-41d9-9996-f02f8daecf95	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.393	2026-06-22 09:28:43.396
f75145c6-b71b-4be0-bc68-daea22428387	e36eab12-7f32-49ed-b873-6e12ed6989d5	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.399	2026-06-22 09:28:43.402
250db7e2-6f6f-47ee-9bc6-fee27d9c5a03	e36eab12-7f32-49ed-b873-6e12ed6989d5	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.399	2026-06-22 09:28:43.402
8047a19d-3194-4f85-9728-961e45454691	e36eab12-7f32-49ed-b873-6e12ed6989d5	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.399	2026-06-22 09:28:43.402
4636e595-ad6d-46e2-9f8c-6c7213906df5	a3b683e1-9442-4f93-b0b9-4832d347c431	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.406	2026-06-22 09:28:43.411
f38f6e98-25dd-4b89-b601-00788b188388	a3b683e1-9442-4f93-b0b9-4832d347c431	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.406	2026-06-22 09:28:43.411
759b45ce-1a37-48be-ac90-ab3bb3debdc2	a3b683e1-9442-4f93-b0b9-4832d347c431	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.406	2026-06-22 09:28:43.411
018d2840-4532-4088-8b6d-72d0066d9bb9	9278c158-e722-496e-9ed2-bdd86b0b6500	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.415	2026-06-22 09:28:43.419
49967d20-b7e5-439c-b97c-1a3b535cb5e6	9278c158-e722-496e-9ed2-bdd86b0b6500	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.415	2026-06-22 09:28:43.419
e80100c2-56f4-4af3-9515-06809b80a7b3	9278c158-e722-496e-9ed2-bdd86b0b6500	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.415	2026-06-22 09:28:43.419
eb6bb4da-8d09-49f6-a7b5-a2bf409c8a6c	511325ec-4b9c-42a6-b67e-60ea0ed2db00	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.422	2026-06-22 09:28:43.425
d129f387-0409-4a76-9891-49436c594db6	511325ec-4b9c-42a6-b67e-60ea0ed2db00	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.422	2026-06-22 09:28:43.425
539eb523-7e09-4cf0-b2f8-3aa37bad7af5	511325ec-4b9c-42a6-b67e-60ea0ed2db00	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.422	2026-06-22 09:28:43.425
1ee48e1b-cc1a-4f41-a5da-81b551053b5f	18d19df2-74c7-41f9-9bb8-26cce623f714	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.431	2026-06-22 09:28:43.435
3dff1b09-ab7c-46a3-abbc-c3fa4ff3f8f0	18d19df2-74c7-41f9-9bb8-26cce623f714	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.431	2026-06-22 09:28:43.435
57614197-baf7-4459-8f90-ac741468fda3	18d19df2-74c7-41f9-9bb8-26cce623f714	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.431	2026-06-22 09:28:43.435
baf03227-eaed-4d95-84ae-6c9dc848758f	ab9d4f3d-0948-4c99-b527-3274308c6778	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.439	2026-06-22 09:28:43.442
9a69765b-1f6b-42e9-a6a5-6fe9e78ae5dc	ab9d4f3d-0948-4c99-b527-3274308c6778	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.439	2026-06-22 09:28:43.442
d6f74edd-6677-4bee-8875-c21c8796b728	ab9d4f3d-0948-4c99-b527-3274308c6778	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.439	2026-06-22 09:28:43.442
e3022118-07a6-4e11-9538-556bdfcbdf2d	8e0eaf5d-6919-4c79-bfad-593f6ce69101	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.445	2026-06-22 09:28:43.449
5c81c3ce-4ed5-481e-8bb5-2b7ff4746c87	8e0eaf5d-6919-4c79-bfad-593f6ce69101	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.445	2026-06-22 09:28:43.449
cec38dbb-393f-4275-afc5-d474749b2d8e	8e0eaf5d-6919-4c79-bfad-593f6ce69101	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.445	2026-06-22 09:28:43.449
e26f7f85-1cf5-4734-9977-f0e4df77004f	32263c67-6a11-4e1e-ad26-c508b80de3f6	Planting	Crop	\N	\N	\N	\N	Planted first season crop in main plot	2026-04-23 09:28:43.452	2026-06-22 09:28:43.456
e44d8105-8129-4ce0-81a2-1bbd71f457ed	32263c67-6a11-4e1e-ad26-c508b80de3f6	Fertilizing	Crop	\N	\N	\N	25000.00	Applied NPK fertilizer	2026-05-08 09:28:43.452	2026-06-22 09:28:43.456
cba01def-7774-4efc-be60-c857dee90585	32263c67-6a11-4e1e-ad26-c508b80de3f6	Weeding	Crop	\N	\N	\N	\N	Manual weeding of all rows	2026-05-23 09:28:43.452	2026-06-22 09:28:43.456
\.


--
-- Data for Name: FarmerCrop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerCrop" (id, "farmerId", "cropId", "plantedDate", "expectedHarvestDate", "actualHarvestDate", "plotSizeHectares", status, "estimatedYieldKg", "actualYieldKg", notes, "createdAt", "updatedAt") FROM stdin;
251b9db9-752c-41d1-aef7-1d118f66ce43	1ee83493-6d3b-4af0-8043-a90c91ccec18	maize	2026-06-12 04:48:17.221	\N	\N	1.30	growing	\N	\N	\N	2026-06-22 09:28:42.485	2026-06-22 09:28:42.485
4b7cac8a-b8a1-42e9-9b17-b30a85f4f573	1ee83493-6d3b-4af0-8043-a90c91ccec18	potato	2026-06-10 22:54:36.805	\N	\N	1.30	growing	\N	\N	\N	2026-06-22 09:28:42.503	2026-06-22 09:28:42.503
4ca13096-01e7-4e47-8a5f-92645622e959	a22b0898-d778-4359-afbd-c141f1715707	potato	2026-04-30 02:40:10.946	\N	\N	0.90	growing	\N	\N	\N	2026-06-22 09:28:42.508	2026-06-22 09:28:42.508
e93ae453-a024-45a4-a956-75f3c3f63431	a22b0898-d778-4359-afbd-c141f1715707	beans	2026-05-16 00:08:49.15	\N	\N	0.90	growing	\N	\N	\N	2026-06-22 09:28:42.512	2026-06-22 09:28:42.512
9a891c01-89e4-4e61-902d-31de9e6e847a	4e540a68-eb3d-4333-8823-8633ed91c38c	maize	2026-03-30 02:02:25.459	\N	\N	1.50	growing	\N	\N	\N	2026-06-22 09:28:42.518	2026-06-22 09:28:42.518
7e390ac6-0816-49c2-bcb3-945d3471c023	4e540a68-eb3d-4333-8823-8633ed91c38c	wheat	2026-06-10 17:18:06.159	\N	\N	1.50	growing	\N	\N	\N	2026-06-22 09:28:42.521	2026-06-22 09:28:42.521
98c0496f-bdd8-4da0-88ee-a495148234c3	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	coffee	2026-05-09 08:27:20.169	\N	\N	0.80	growing	\N	\N	\N	2026-06-22 09:28:42.526	2026-06-22 09:28:42.526
f8d985f7-4497-431e-973f-389e95c1ea42	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	banana	2026-05-26 10:23:24.317	\N	\N	0.80	growing	\N	\N	\N	2026-06-22 09:28:42.529	2026-06-22 09:28:42.529
536d71d1-31f3-4245-9fb5-d437bd2b1dbf	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	coffee	2026-04-11 18:32:55.493	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.535	2026-06-22 09:28:42.535
859f8eed-db66-4381-ae57-579b0b287582	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	beans	2026-05-19 04:31:10.726	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.538	2026-06-22 09:28:42.538
de605102-8d93-409c-b8f9-9f3e336a0673	18246537-c9fb-41a4-b94f-89944fff9c43	beans	2026-05-24 10:38:03.659	\N	\N	0.60	growing	\N	\N	\N	2026-06-22 09:28:42.544	2026-06-22 09:28:42.544
94f8e965-46df-4298-89fe-86561b37320c	18246537-c9fb-41a4-b94f-89944fff9c43	sorghum	2026-05-13 20:21:02.023	\N	\N	0.60	growing	\N	\N	\N	2026-06-22 09:28:42.548	2026-06-22 09:28:42.548
19c7c5ca-cd84-4ccf-a01a-362d5446815f	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	beans	2026-06-05 07:50:03.626	\N	\N	1.00	growing	\N	\N	\N	2026-06-22 09:28:42.553	2026-06-22 09:28:42.553
2ab5c225-3da0-44be-8b89-efa40027fcc3	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	maize	2026-03-24 19:06:08.35	\N	\N	1.00	growing	\N	\N	\N	2026-06-22 09:28:42.556	2026-06-22 09:28:42.556
8335178f-b174-4e00-8e87-7cfbd9824a60	8b12ccf0-99ce-438a-ae92-9b0b128c5730	rice	2026-04-06 15:39:55.919	\N	\N	1.80	growing	\N	\N	\N	2026-06-22 09:28:42.561	2026-06-22 09:28:42.561
1ca786c6-ec52-46e0-9665-7113ba7abcba	8b12ccf0-99ce-438a-ae92-9b0b128c5730	beans	2026-04-08 10:53:10.059	\N	\N	1.80	growing	\N	\N	\N	2026-06-22 09:28:42.565	2026-06-22 09:28:42.565
29fa9be0-8edc-40e6-94c4-8038401abd2d	13065b12-d33e-4f5b-9200-772bea57226c	rice	2026-05-11 17:37:48.868	\N	\N	4.00	growing	\N	\N	\N	2026-06-22 09:28:42.57	2026-06-22 09:28:42.57
71dd6276-5505-41f5-8d78-59fa8a050a33	53953eec-9a9d-4622-9e22-d21cfc2c5fac	cassava	2026-04-07 20:26:56.157	\N	\N	1.40	growing	\N	\N	\N	2026-06-22 09:28:42.576	2026-06-22 09:28:42.576
256093b3-79c6-48d5-bb8f-b46597de469c	53953eec-9a9d-4622-9e22-d21cfc2c5fac	maize	2026-03-27 12:01:17.712	\N	\N	1.40	growing	\N	\N	\N	2026-06-22 09:28:42.58	2026-06-22 09:28:42.58
a820b982-6855-4736-9e78-0798730a142b	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	cassava	2026-05-24 05:09:23.796	\N	\N	0.80	growing	\N	\N	\N	2026-06-22 09:28:42.583	2026-06-22 09:28:42.583
2adcc463-501f-44cb-a0b1-e52caa46619b	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	beans	2026-06-02 18:29:53.035	\N	\N	0.80	growing	\N	\N	\N	2026-06-22 09:28:42.587	2026-06-22 09:28:42.587
a5d69586-b9c3-4d3b-96d3-da6921b10119	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	tea	2026-05-06 22:23:34.5	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.59	2026-06-22 09:28:42.59
5786da0d-1c08-404e-9636-79d53c05e40c	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	coffee	2026-05-06 10:44:57.472	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.593	2026-06-22 09:28:42.593
34da45bc-365b-44e1-a114-3c2ed58255d2	e36eab12-7f32-49ed-b873-6e12ed6989d5	tea	2026-05-15 16:15:02.217	\N	\N	0.90	growing	\N	\N	\N	2026-06-22 09:28:42.598	2026-06-22 09:28:42.598
92b8f83e-aab8-437b-8f25-b12ea1d4c041	e36eab12-7f32-49ed-b873-6e12ed6989d5	banana	2026-04-27 19:17:41.411	\N	\N	0.90	growing	\N	\N	\N	2026-06-22 09:28:42.601	2026-06-22 09:28:42.601
c374e9ff-d388-4893-8360-a9f921ca400b	a3b683e1-9442-4f93-b0b9-4832d347c431	wheat	2026-03-25 13:33:14.899	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.604	2026-06-22 09:28:42.604
ae549819-d917-4096-bceb-e557fba7800a	a3b683e1-9442-4f93-b0b9-4832d347c431	potato	2026-04-26 17:40:19.118	\N	\N	1.10	growing	\N	\N	\N	2026-06-22 09:28:42.608	2026-06-22 09:28:42.608
f921a3c7-dcf5-4ad0-b2d0-f043d8070ef0	9278c158-e722-496e-9ed2-bdd86b0b6500	coffee	2026-03-30 07:02:54.565	\N	\N	3.20	growing	\N	\N	\N	2026-06-22 09:28:42.613	2026-06-22 09:28:42.613
50f4b8c7-f36c-4a06-b047-33e4d898faed	511325ec-4b9c-42a6-b67e-60ea0ed2db00	coffee	2026-06-15 01:09:15.42	\N	\N	1.40	growing	\N	\N	\N	2026-06-22 09:28:42.616	2026-06-22 09:28:42.616
1cd6d944-aa79-407e-b28f-8933f0df3f12	511325ec-4b9c-42a6-b67e-60ea0ed2db00	beans	2026-04-08 02:01:27.246	\N	\N	1.40	growing	\N	\N	\N	2026-06-22 09:28:42.618	2026-06-22 09:28:42.618
427d1d91-3434-49d9-b573-da5c39442680	18d19df2-74c7-41f9-9bb8-26cce623f714	banana	2026-04-12 18:43:24.237	\N	\N	0.70	growing	\N	\N	\N	2026-06-22 09:28:42.623	2026-06-22 09:28:42.623
09aaac8c-31aa-43cc-b374-f12b8d957a53	18d19df2-74c7-41f9-9bb8-26cce623f714	maize	2026-05-09 05:23:50.906	\N	\N	0.70	growing	\N	\N	\N	2026-06-22 09:28:42.626	2026-06-22 09:28:42.626
43efa86f-868f-46a7-8562-49dfe99cc289	ab9d4f3d-0948-4c99-b527-3274308c6778	beans	2026-05-21 10:19:39.804	\N	\N	0.60	growing	\N	\N	\N	2026-06-22 09:28:42.63	2026-06-22 09:28:42.63
6a5748fb-4115-48ad-845b-d5b4478e7e98	ab9d4f3d-0948-4c99-b527-3274308c6778	wheat	2026-04-14 09:55:58.037	\N	\N	0.60	growing	\N	\N	\N	2026-06-22 09:28:42.634	2026-06-22 09:28:42.634
fe7f3afc-6e46-4f18-b456-5514a387b0b4	8e0eaf5d-6919-4c79-bfad-593f6ce69101	maize	2026-06-12 20:55:36.743	\N	\N	0.50	growing	\N	\N	\N	2026-06-22 09:28:42.638	2026-06-22 09:28:42.638
bb6cd7ee-32ed-4b93-81df-8ea59a2cf33a	8e0eaf5d-6919-4c79-bfad-593f6ce69101	cassava	2026-05-29 11:07:41.308	\N	\N	0.50	growing	\N	\N	\N	2026-06-22 09:28:42.642	2026-06-22 09:28:42.642
71b2d81a-29e2-4829-bb86-9c47d95d7309	32263c67-6a11-4e1e-ad26-c508b80de3f6	beans	2026-03-25 19:33:12.811	\N	\N	0.70	growing	\N	\N	\N	2026-06-22 09:28:42.645	2026-06-22 09:28:42.645
74b11478-dd1b-4f2c-8935-bf94f77f1d3b	32263c67-6a11-4e1e-ad26-c508b80de3f6	banana	2026-05-09 13:13:49.995	\N	\N	0.70	growing	\N	\N	\N	2026-06-22 09:28:42.648	2026-06-22 09:28:42.648
\.


--
-- Data for Name: FarmerFiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerFiles" (id, "farmerId", "fileType", "filePath", "uploadedAt") FROM stdin;
\.


--
-- Data for Name: FarmerProfile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FarmerProfile" (id, "userId", "cooperativeId", "fullName", "farmName", location, district, sector, cell, village, "farmSizeHectares", "gpsLatitude", "gpsLongitude", "elevationMeters", "soilType", "waterSource", "irrigationType", "preferredChannel", "literacyLevel", "profileImageUrl", "emergencyContact", "familyMembers", "createdAt", "updatedAt", "verificationStatus", "verifiedBy", "verifiedAt", cell_code, "deletedAt", district_code, province_code, sector_code, village_code) FROM stdin;
1ee83493-6d3b-4af0-8043-a90c91ccec18	50e518eb-202f-40d2-aebe-9fccc78c1574	96113786-9853-40a6-83f7-27b3d0750553	Jean Damascene Habimana	Habimana Family Farm	\N	Musanze	Kinigi	\N	\N	2.50	-1.43330000	29.63330000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.012	2026-06-22 09:28:42.012	pending	\N	\N	\N	\N	\N	\N	\N	\N
a22b0898-d778-4359-afbd-c141f1715707	dd2c95fa-b680-43dd-97c8-d6b4e2ee3ad6	96113786-9853-40a6-83f7-27b3d0750553	Solange Uwimana	Uwimana Green Farm	\N	Musanze	Kinigi	\N	\N	1.80	-1.44100000	29.62000000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.053	2026-06-22 09:28:42.053	pending	\N	\N	\N	\N	\N	\N	\N	\N
4e540a68-eb3d-4333-8823-8633ed91c38c	9fd36cce-c67a-4ca6-9f13-42fac6040ba3	96113786-9853-40a6-83f7-27b3d0750553	Célestin Bizimana	Bizimana Hillside Farm	\N	Musanze	Kinigi	\N	\N	3.00	-1.42900000	29.64000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.077	2026-06-22 09:28:42.077	pending	\N	\N	\N	\N	\N	\N	\N	\N
fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	3178036f-6cc2-42a2-90eb-39e77f1d4948	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	Claudine Mukandayisenga	Mukand Riverside Farm	\N	Rubavu	Gisenyi	\N	\N	1.50	-1.68330000	29.26670000	\N	Sandy Loam	river	flood	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.102	2026-06-22 09:28:42.102	pending	\N	\N	\N	\N	\N	\N	\N	\N
0ad1c8e4-0970-4ce2-b059-b31f84a362a8	44570b40-1306-48d3-9ad8-c7e35d6d1bb2	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	Théophile Ntungwanayo	Ntu Lake Farm	\N	Rubavu	Gisenyi	\N	\N	2.20	-1.67500000	29.28000000	\N	Loamy	well	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.126	2026-06-22 09:28:42.126	pending	\N	\N	\N	\N	\N	\N	\N	\N
18246537-c9fb-41a4-b94f-89944fff9c43	3c1d241f-8e44-4593-92c7-71c43bef6321	29b880ab-18ce-498c-882a-23acc69e184d	Immaculée Uwera	Uwera Southern Farm	\N	Huye	Ngoma	\N	\N	1.20	-2.59900000	29.73900000	\N	Clay	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.152	2026-06-22 09:28:42.152	pending	\N	\N	\N	\N	\N	\N	\N	\N
d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	029ce168-ede8-4570-ac71-53ec67f39c88	29b880ab-18ce-498c-882a-23acc69e184d	Évariste Nzigiyimana	Nzigi Valley Farm	\N	Huye	Ngoma	\N	\N	2.00	-2.60500000	29.74500000	\N	Sandy	well	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.173	2026-06-22 09:28:42.173	pending	\N	\N	\N	\N	\N	\N	\N	\N
8b12ccf0-99ce-438a-ae92-9b0b128c5730	95119af2-ae90-48fb-bcd0-a763edc93fb9	77e18590-773b-4342-869c-8b24aaf6ae5f	Vestine Nkusi	Nkusi Marshland Farm	\N	Bugesera	Nyamata	\N	\N	3.50	-2.15300000	30.05200000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.193	2026-06-22 09:28:42.193	pending	\N	\N	\N	\N	\N	\N	\N	\N
13065b12-d33e-4f5b-9200-772bea57226c	f8d3d0f4-5b69-45a6-9db2-cc74e65422ac	77e18590-773b-4342-869c-8b24aaf6ae5f	Patrice Mugabo	Mugabo Rice Fields	\N	Bugesera	Nyamata	\N	\N	4.00	-2.16100000	30.06000000	\N	Alluvial	river	flood	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.221	2026-06-22 09:28:42.221	pending	\N	\N	\N	\N	\N	\N	\N	\N
53953eec-9a9d-4622-9e22-d21cfc2c5fac	63a0964b-1e2c-4966-abeb-43032ad4ffaa	eb77e4b2-0772-4081-92b3-975c3001ce66	Domitille Uwimana	Uwimana Eastern Farm	\N	Kayonza	Kabarondo	\N	\N	2.80	-1.59700000	30.62800000	\N	Sandy Loam	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.24	2026-06-22 09:28:42.24	pending	\N	\N	\N	\N	\N	\N	\N	\N
ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	7f287c02-3229-4b17-a27f-2e6a49bb3507	eb77e4b2-0772-4081-92b3-975c3001ce66	Alexis Mugenzi	Mugenzi Savanna Farm	\N	Kayonza	Kabarondo	\N	\N	1.60	-1.60200000	30.63500000	\N	Sandy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.26	2026-06-22 09:28:42.26	pending	\N	\N	\N	\N	\N	\N	\N	\N
193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	70706fa6-97bb-4fc0-9394-46bc5adb42bf	5ae0ec04-591e-4049-a50d-8f7000cc7535	Chantal Nkurukiyinka	Nkuru Tea Gardens	\N	Nyamasheke	Kagano	\N	\N	2.10	-2.33500000	29.17800000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.281	2026-06-22 09:28:42.281	pending	\N	\N	\N	\N	\N	\N	\N	\N
e36eab12-7f32-49ed-b873-6e12ed6989d5	02efc48d-6321-4825-b58c-f989211ac79f	5ae0ec04-591e-4049-a50d-8f7000cc7535	Félix Rutagengwa	Rutagengwa Lake Farm	\N	Nyamasheke	Kagano	\N	\N	1.90	-2.34100000	29.18300000	\N	Loamy	river	flood	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.305	2026-06-22 09:28:42.305	pending	\N	\N	\N	\N	\N	\N	\N	\N
a3b683e1-9442-4f93-b0b9-4832d347c431	43a7bb8a-4c05-432c-991a-5038aad70909	2f8d90e6-4a3e-4402-9838-aca3e72d3469	Fidèle Nshimiyimana	Nshimi Highland Farm	\N	Burera	Rwerere	\N	\N	2.30	-1.47000000	29.85000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.325	2026-06-22 09:28:42.325	pending	\N	\N	\N	\N	\N	\N	\N	\N
9278c158-e722-496e-9ed2-bdd86b0b6500	497693e3-4f8c-45a5-8ab8-729a55e6bddf	ba35c499-df6a-4a50-87d8-ec90ed0532f0	Odette Ingabire	Ingabire Coffee Estate	\N	Nyamagabe	Gasaka	\N	\N	3.20	-2.45200000	29.52000000	\N	Volcanic	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.346	2026-06-22 09:28:42.346	pending	\N	\N	\N	\N	\N	\N	\N	\N
511325ec-4b9c-42a6-b67e-60ea0ed2db00	1edd5ee4-8d47-4db9-ae92-d3bbdd2296d2	ba35c499-df6a-4a50-87d8-ec90ed0532f0	Théogène Mugwaneza	Mugwaneza Arabica Farm	\N	Nyamagabe	Gasaka	\N	\N	2.70	-2.46000000	29.52800000	\N	Loamy	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.366	2026-06-22 09:28:42.366	pending	\N	\N	\N	\N	\N	\N	\N	\N
18d19df2-74c7-41f9-9bb8-26cce623f714	cd460fd5-ba86-4951-88ee-3e344de3baf4	e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	Jean-Paul Habimana	Habimana Banana Grove	\N	Ruhango	Kinazi	\N	\N	1.40	-2.22400000	29.78000000	\N	Loamy	rainwater	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.385	2026-06-22 09:28:42.385	pending	\N	\N	\N	\N	\N	\N	\N	\N
ab9d4f3d-0948-4c99-b527-3274308c6778	4fa4a9ac-cd16-4a35-ab3c-7478f39904d7	7707179b-5295-4def-8c5f-5832a22845eb	Yvonne Mutuyimana	Mutuy Green Acres	\N	Rulindo	Base	\N	\N	1.10	-1.72900000	29.96000000	\N	Clay Loam	well	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.403	2026-06-22 09:28:42.403	pending	\N	\N	\N	\N	\N	\N	\N	\N
8e0eaf5d-6919-4c79-bfad-593f6ce69101	19670a70-2d65-43e3-923a-6da876390c95	7707179b-5295-4def-8c5f-5832a22845eb	Gabriel Niyonzima	Niyonzima Horticulture	\N	Rulindo	Base	\N	\N	0.90	-1.73500000	29.96700000	\N	Sandy Loam	river	drip	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.427	2026-06-22 09:28:42.427	pending	\N	\N	\N	\N	\N	\N	\N	\N
32263c67-6a11-4e1e-ad26-c508b80de3f6	208a4b6a-5544-4d1f-a332-36a2c2251a50	7707179b-5295-4def-8c5f-5832a22845eb	Alice Nyirabashyitsi	Nyira Mixed Farm	\N	Rulindo	Base	\N	\N	1.30	-1.74000000	29.97300000	\N	Loamy	rainwater	sprinkler	smartphone	\N	\N	\N	0	2026-06-22 09:28:42.445	2026-06-22 09:28:42.445	pending	\N	\N	\N	\N	\N	\N	\N	\N
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

COPY public."ForumComment" (id, "postId", content, "parentCommentId", "likesCount", "isAcceptedAnswer", "createdAt", "authorId") FROM stdin;
\.


--
-- Data for Name: ForumPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ForumPost" (id, "cooperativeId", title, content, category, "imageUrls", "likesCount", "commentsCount", "isPinned", "isAnswered", "createdAt", "updatedAt", "attachmentUrls", "audienceId", "audienceType", "authorId", "isKnowledgeBase", priority, status, type, "videoUrls", "viewsCount") FROM stdin;
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
e914cca0-fcec-4c43-838c-0dd6b2f07942	Maize Growing Guide	Maize	Planting	Best practices for spacing, fertilization, and weeding for high-yield maize.	## Introduction\nMaize is a staple crop in Rwanda. Proper planting techniques can significantly increase yield.\n\n## Land Preparation\n- Plough the land to a depth of 20-25cm\n- Ensure proper drainage\n- Apply well-decomposed manure at 10 tonnes per hectare\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 75cm between rows, 25cm between plants\n- Seed rate: 20-25kg per hectare\n- Planting depth: 3-5cm\n\n## Fertilization\n- Apply NPK (17-17-17) at 200kg/ha at planting\n- Top-dress with Urea at 150kg/ha after 4-6 weeks\n\n## Weed Control\n- First weeding: 2-3 weeks after planting\n- Second weeding: 5-6 weeks after planting\n\n## Harvesting\n- Maize matures in 90-120 days\n- Harvest when the husk turns brown\n- Dry to 13-14% moisture content before storage	8	400-600mm	90-120 days	20-30°C	Loamy, well-drained	Sprout	t	2026-06-22 09:28:43.632	2026-06-22 09:28:43.632
c7475550-4fd4-47b1-b8c3-bd693b3b3aee	Pest Management in Beans	Beans	Protection	How to identify and treat common pests in bean plantations organically.	## Common Bean Pests\n\n### Bean Aphids\n- **Symptoms**: Curled leaves, stunted growth\n- **Control**: Use neem oil spray or insecticidal soap\n\n### Bean Fly\n- **Symptoms**: Wilting seedlings, swollen stem base\n- **Control**: Seed dressing with appropriate insecticide\n\n### Bean Rust\n- **Symptoms**: Rust-colored spots on leaves\n- **Control**: Remove infected plants, use resistant varieties\n\n## Preventive Measures\n- Practice crop rotation with non-legumes\n- Use certified disease-free seeds\n- Maintain proper plant spacing for air circulation\n- Remove and destroy crop residues after harvest	7	\N	60-90 days	15-25°C	Well-drained loam	Bug	t	2026-06-22 09:28:43.64	2026-06-22 09:28:43.64
6c1fc568-56bd-41d0-8dd1-1f25f6a90087	Drip Irrigation Setup	Rice	Water	Step-by-step guide to installing and maintaining a drip irrigation system.	## Benefits of Drip Irrigation\n- Water savings of 40-60%\n- Reduced weed growth\n- Better nutrient absorption\n- Higher yields\n\n## Components Needed\n1. Water source (tank or tap)\n2. Main line (PVC pipe)\n3. Sub-main lines\n4. Drip tapes/emitters\n5. Filters (screen or disc)\n6. Pressure regulator\n\n## Installation Steps\n\n### Step 1: Plan the Layout\n- Measure your field dimensions\n- Mark rows for crop planting\n- Calculate water requirements\n\n### Step 2: Install Main Line\n- Lay PVC pipe from water source\n- Install filter and pressure regulator\n- Add control valves for each section\n\n### Step 3: Install Drip Tapes\n- Lay drip tapes along crop rows\n- Space emitters according to crop type\n- Connect to sub-main lines\n\n### Step 4: Test the System\n- Flush the system before first use\n- Check for leaks at connections\n- Adjust pressure to 1-2 bars\n\n## Maintenance\n- Clean filters weekly\n- Flush lines monthly\n- Replace damaged emitters promptly\n- Drain system before frost	12	Efficient (40-60% less)	\N	All climates	\N	Droplets	t	2026-06-22 09:28:43.645	2026-06-22 09:28:43.645
d5f75aa3-e8f6-4a45-82e6-2d713bfb6ab3	Post-Harvest Handling	Maize	Harvest	Reducing losses during storage and transport of grains.	## Importance of Post-Harvest Handling\nPost-harvest losses in Rwanda can reach 30%. Proper handling preserves quality and ensures food security.\n\n## Harvesting\n- Harvest at the right maturity stage\n- Use clean harvesting tools\n- Avoid damaging grains during harvest\n\n## Drying\n- Sun-dry on clean tarpaulins (not directly on soil)\n- Stir regularly for even drying\n- Dry to 13-14% moisture content\n- Use moisture meter for accuracy\n\n## Shelling/Threshing\n- Shell when grains are properly dry\n- Use mechanical shellers to reduce damage\n- Clean grains after shelling\n\n## Storage\n- Use clean, airtight containers\n- Add natural repellents (neem leaves, chili)\n- Store in a cool, dry place\n- Inspect regularly for pests\n\n## Transportation\n- Use clean, dry sacks\n- Protect from rain and moisture\n- Avoid overfilling sacks which causes grain damage	6	N/A (dry process)	\N	\N	\N	Leaf	t	2026-06-22 09:28:43.65	2026-06-22 09:28:43.65
c7741e0a-59b5-46d0-82b5-7193b9a6c59f	Tomato Growing Guide	Tomato	Planting	Complete guide to growing healthy tomatoes from nursery to harvest.	## Nursery Establishment\n- Prepare a seedbed of 1m width\n- Mix soil with well-decomposed manure\n- Sow seeds in rows 10cm apart\n- Water gently twice daily\n- Transplant after 3-4 weeks\n\n## Transplanting\n- Space plants 60cm between rows, 45cm between plants\n- Transplant in the evening\n- Water immediately after planting\n\n## Staking\n- Stake plants to keep fruits off the ground\n- Use wooden stakes or trellis system\n- Tie stems loosely with soft material\n\n## Fertilization\n- Apply DAP at transplanting\n- Apply CAN at 3 and 6 weeks after transplanting\n- Side-dress with compost\n\n## Common Diseases\n- **Late blight**: Remove infected leaves, spray with fungicide\n- **Bacterial wilt**: Practice crop rotation, remove infected plants\n\n## Harvesting\n- Harvest starts 60-80 days after transplanting\n- Pick at the breaker stage (first color change)\n- Handle gently to avoid bruising	10	500-800mm	90-110 days	20-27°C	Well-drained sandy loam	Sprout	t	2026-06-22 09:28:43.653	2026-06-22 09:28:43.653
e5996e69-3a48-42ad-a649-9113963d2eff	Soil Conservation Techniques	Beans	Protection	Methods to prevent soil erosion and maintain soil fertility on sloping farmland.	## Why Soil Conservation Matters\nSoil erosion is a major challenge in Rwanda's hilly landscape. Losing topsoil reduces crop yields significantly.\n\n## Terracing\n- Build bench terraces on slopes\n- Maintain terrace risers with grass\n- Use stones where available for reinforcement\n\n## Contour Farming\n- Plough along contour lines\n- Reduces runoff speed\n- Increases water infiltration\n\n## Cover Cropping\n- Plant legumes as ground cover\n- Reduces soil erosion between seasons\n- Adds nitrogen to the soil\n\n## Mulching\n- Apply organic mulch 5-10cm thick\n- Retains soil moisture\n- Suppresses weed growth\n- Adds organic matter when decomposed\n\n## Agroforestry\n- Plant trees on farm boundaries\n- Trees provide shade and wind breaks\n- Leaves add nutrients to soil\n- Roots hold soil together	8	\N	\N	All climates	\N	Leaf	t	2026-06-22 09:28:43.657	2026-06-22 09:28:43.657
2430ced3-de82-4ddc-bbea-2822178e7cb9	Dairy Cow Nutrition	\N	Feeding	Balanced feed formulations for maximizing milk production.	## Nutritional Requirements for Dairy Cows\n\n### Forage (60-70% of diet)\n- Good quality Napier grass\n- Rhodes grass or natural pasture\n- Leguminous forages (desmodium, lucerne)\n\n### Concentrates (30-40% of diet)\n- Maize germ meal\n- Rice bran\n- Cotton seed cake or soybean meal\n- Mineral supplements\n\n## Feeding Schedule\n- Morning: 6-8kg of forage + 2-3kg of concentrate\n- Mid-day: Free access to water + mineral lick\n- Evening: 6-8kg of forage + 2-3kg of concentrate\n\n## Water Requirements\n- A lactating cow needs 60-80 liters of water daily\n- Ensure clean, fresh water at all times\n\n## Mineral Supplementation\n- Provide salt lick blocks\n- Supplement with Calcium and Phosphorus\n- Add Vitamin A, D, E complex\n\n## Signs of Good Nutrition\n- Shiny coat\n- Normal manure consistency\n- High milk yield\n- Regular heat cycles\n- Healthy calves at birth	10	\N	\N	\N	\N	Milk	t	2026-06-22 09:28:43.662	2026-06-22 09:28:43.662
53cc1ef1-0c24-472a-b365-876d580edbde	Poultry Disease Prevention	\N	Health	Vaccination schedules and hygiene practices for healthy chickens.	## Essential Vaccinations\n\n### Day-old chicks\n- Newcastle Disease (NDV) vaccine - eye drop\n- Gumboro vaccine\n\n### Week 2\n- NDV booster\n- Fowl Pox vaccine\n\n### Week 4\n- Gumboro booster\n\n### Week 8\n- NDV (killed vaccine) - injection\n\n## Biosecurity Measures\n- Limit visitors to the poultry house\n- Use footbaths with disinfectant\n- Change clothes before entering\n- Keep different age groups separate\n\n## Hygiene Practices\n- Clean and disinfect housing regularly\n- Provide clean bedding (wood shavings)\n- Clean waterers and feeders daily\n- Remove manure frequently\n\n## Common Diseases\n- **Newcastle Disease**: Respiratory distress, green diarrhea, high mortality\n- **Gumboro**: Depression, ruffled feathers, vent picking\n- **Fowl Pox**: Wart-like lesions on comb and wattles\n- **Coccidiosis**: Bloody droppings, reduced feed intake\n\n## Prevention Tips\n- Source chicks from reliable hatcheries\n- Quarantine new birds for 2 weeks\n- Maintain proper ventilation\n- Provide balanced nutrition for immunity	8	\N	\N	\N	\N	Bug	t	2026-06-22 09:28:43.665	2026-06-22 09:28:43.665
50b8f621-d861-4339-8a13-4e85a532e073	Pig Farming Basics	\N	General	A beginner guide to housing, breeding, and feeding pigs.	## Housing Requirements\n- Well-ventilated pigsty\n- Concrete floor with proper drainage\n- Separate areas for feeding, sleeping, and dunging\n- Space: 2-3 sq meters per adult pig\n- Roof to provide shade and rain protection\n\n## Choosing Breeds\n- **Landrace**: Good mothering, long body\n- **Large White**: Fast growth, good for meat\n- **Local breeds**: Hardy, disease-resistant\n- Crossbreeds often combine best traits\n\n## Feeding\n### Grower pigs (20-50kg)\n- 1.5-2kg of balanced feed per day\n- Protein content: 16-18%\n\n### Finisher pigs (50-90kg)\n- 2.5-3kg of balanced feed per day\n- Protein content: 14-16%\n\n### Breeding sows\n- Increase feed during gestation\n- Flush feeding before breeding\n- Extra nutrition during lactation\n\n## Breeding Management\n- Sow reaches breeding age at 6-8 months\n- Gestation period: 114 days (3 months, 3 weeks, 3 days)\n- Litter size: 8-12 piglets\n- Weaning at 4-6 weeks\n\n## Health Management\n- Deworm every 3 months\n- Vaccinate against swine fever\n- Trim hooves if overgrown\n- Monitor for signs of illness: fever, loss of appetite, diarrhea	14	\N	\N	\N	\N	Dog	t	2026-06-22 09:28:43.67	2026-06-22 09:28:43.67
4579a885-f8da-4c7d-86e8-dbdde0c58ba1	Beans Growing Guide	Beans	Planting	Best practices for planting, managing, and harvesting beans.	## Land Preparation\n- Plough to a depth of 15-20cm\n- Remove weeds and crop residues\n- Prepare raised beds if drainage is poor\n\n## Planting\n- Plant at the onset of rains\n- Spacing: 40cm between rows, 20cm between plants\n- Seed rate: 60-80kg per hectare\n- Planting depth: 3-5cm\n\n## Varieties\n- **Bush beans**: Mature in 60-75 days, no staking needed\n- **Climbing beans**: Mature in 90-110 days, require staking\n\n## Fertilization\n- Apply DAP at 100kg/ha at planting\n- Beans fix their own nitrogen (inoculate seeds)\n- Apply organic manure at 5 tonnes/ha\n\n## Weed Management\n- First weeding: 2-3 weeks after planting\n- Second weeding: before flowering\n- Mulch between rows to suppress weeds\n\n## Harvesting\n- Bush beans: Harvest 60-75 days after planting\n- Climbing beans: Harvest 90-110 days after planting\n- Harvest when pods turn yellow and dry\n- Thresh and clean, then dry to 14% moisture	7	300-500mm	60-110 days	18-25°C	Well-drained loam	Sprout	t	2026-06-22 09:28:43.673	2026-06-22 09:28:43.673
59df2927-3f0e-46c3-8fce-ded057421232	Rice Growing Guide	Rice	Planting	Complete guide to rice cultivation from nursery to harvest.	## Nursery Preparation\n- Prepare a wet nursery near water source\n- Level the seedbed carefully\n- Soak seeds for 24 hours before sowing\n- Sow pre-germinated seeds evenly\n- Maintain 2-3cm water level\n\n## Land Preparation\n- Plough and puddle the field\n- Level the field for uniform water distribution\n- Apply well-decomposed manure before transplanting\n\n## Transplanting\n- Transplant seedlings at 3-4 leaf stage (20-25 days)\n- Spacing: 20cm x 20cm\n- Transplant 2-3 seedlings per hill\n- Transplant in straight rows\n\n## Water Management\n- Maintain 5-7cm water depth after transplanting\n- Drain field 7 days before harvest\n- Use alternate wetting and drying to save water\n\n## Fertilization\n- Apply NPK at 200kg/ha before transplanting\n- Top-dress with Urea at 100kg/ha at tillering\n- Top-dress with Urea at 50kg/ha at panicle initiation\n\n## Pest Management\n- **Rice blast**: Use resistant varieties\n- **Stem borer**: Remove egg masses from leaves\n- **Rodents**: Keep field edges clean\n\n## Harvesting\n- Harvest when 80% of grains are golden\n- Cut stems 15-20cm above ground\n- Thresh immediately after harvest\n- Dry to 14% moisture content	10	800-1200mm	120-150 days	20-35°C	Clay loam with good water retention	Sprout	t	2026-06-22 09:28:43.676	2026-06-22 09:28:43.676
8faedce6-701d-4864-affb-3af885697b51	Irrigation Water Management	Tomato	Water	Efficient water scheduling and management techniques for vegetable farming.	## Water Requirements by Crop Stage\n\n### Nursery Stage\n- Light watering 2-3 times daily\n- Use fine spray to avoid seed displacement\n\n### Vegetative Stage\n- Water every 2-3 days\n- Apply 20-30mm per week\n\n### Flowering Stage\n- Regular watering critical\n- Apply 30-40mm per week\n- Moisture stress causes flower drop\n\n### Fruiting Stage\n- Apply 40-50mm per week\n- Consistent moisture for uniform fruit development\n- Mulch to reduce evaporation\n\n## Irrigation Methods\n\n### Drip Irrigation (Recommended)\n- Water efficiency: 90%\n- Apply directly to root zone\n- Use with fertigation for best results\n\n### Furrow Irrigation\n- Water efficiency: 60%\n- Simple and low-cost\n- Requires well-levelled fields\n\n### Sprinkler Irrigation\n- Water efficiency: 75%\n- Covers large areas quickly\n- Not suitable for windy areas\n\n## Water Quality\n- Test water for salinity\n- Avoid water with high sodium content\n- Filter water to remove sediment\n\n## Scheduling Tips\n- Irrigate early morning or evening\n- Check soil moisture before watering\n- Use rain gauge to track rainfall\n- Adjust schedule based on weather	9	400-600mm	\N	All climates	\N	Droplets	t	2026-06-22 09:28:43.68	2026-06-22 09:28:43.68
5a0d0fef-75fa-48a8-b805-0fcc3700c9db	Organic Farming Practices	Maize	Protection	Natural methods for soil fertility and pest control without synthetic chemicals.	## Principles of Organic Farming\n1. Work with natural systems\n2. Build soil health\n3. Promote biodiversity\n4. Use renewable resources\n5. Minimize external inputs\n\n## Building Soil Fertility\n\n### Composting\n- Layer green materials with dry materials\n- Keep pile moist\n- Turn every 2 weeks\n- Ready in 3-4 months\n\n### Green Manure\n- Plant legumes (mucuna, lablab)\n- Incorporate into soil before flowering\n- Adds nitrogen and organic matter\n\n### Animal Manure\n- Well-decomposed manure\n- Apply 10-15 tonnes per hectare\n- Incorporate into soil before planting\n\n## Natural Pest Control\n\n### Companion Planting\n- Plant marigolds near tomatoes to repel nematodes\n- Plant onions near carrots to repel carrot fly\n- Use garlic spray as general repellent\n\n### Biological Control\n- Attract beneficial insects (ladybugs, lacewings)\n- Use neem-based products\n- Introduce predatory insects\n\n### Cultural Control\n- Crop rotation\n- Intercropping\n- Proper spacing\n- Timely planting\n\n## Certification\n- Transition period: 2-3 years\n- Keep records of all practices\n- Soil tests required\n- Inspection by certifying body	11	\N	\N	\N	\N	Leaf	t	2026-06-22 09:28:43.684	2026-06-22 09:28:43.684
cc1b9465-a904-4d61-8398-42edc6fcdbe6	Disease Management in Tomatoes	Tomato	Protection	Identifying and controlling common tomato diseases in Rwandan conditions.	## Common Tomato Diseases\n\n### Late Blight (Phytophthora infestans)\n- **Symptoms**: Dark water-soaked spots on leaves, white mold on undersides\n- **Conditions**: Cool, wet weather (15-20°C, high humidity)\n- **Control**: Remove infected leaves, copper-based fungicide\n\n### Early Blight (Alternaria solani)\n- **Symptoms**: Dark concentric rings on lower leaves\n- **Control**: Mulch around plants, avoid overhead watering\n\n### Bacterial Wilt (Ralstonia solanacearum)\n- **Symptoms**: Sudden wilting, brown vascular tissue\n- **Control**: Use resistant varieties, crop rotation (4+ years)\n\n### Tomato Yellow Leaf Curl Virus\n- **Symptoms**: Yellowing, curling leaves, stunted growth\n- **Control**: Control whiteflies, use virus-free seedlings\n\n## Integrated Disease Management\n1. Use certified disease-free seeds\n2. Practice crop rotation (3-4 years)\n3. Ensure proper spacing for airflow\n4. Remove and destroy infected plants\n5. Use resistant varieties when available\n6. Apply fungicides preventively in high-risk periods\n\n## Fungicide Application Schedule\n- Start 2 weeks after transplanting\n- Apply every 7-14 days depending on weather\n- Alternate fungicides to prevent resistance\n- Stop application 7 days before harvest	9	\N	90-110 days	20-27°C	Well-drained sandy loam	Bug	t	2026-06-22 09:28:43.687	2026-06-22 09:28:43.687
a42f3d68-1822-432c-8a6f-4697ab4a7132	Harvest and Storage of Grains	Maize	Harvest	Proper techniques for harvesting, drying, and storing grain crops.	## Harvest Timing\n\n### Maize\n- Harvest when black layer forms at kernel tip\n- Moisture content: 25-30% for maize\n- Dry to 13-14% for storage\n\n### Beans\n- Harvest when pods turn yellow-brown\n- Dry pods in sun before shelling\n- Target moisture: 14%\n\n### Rice\n- Harvest at 80% golden color\n- Moisture content: 20-25%\n- Dry to 14% for storage\n\n## Drying Methods\n\n### Sun Drying\n- Spread grains in thin layer (5-10cm)\n- Use clean tarpaulins, not bare ground\n- Stir every 2-3 hours\n- Cover at night and during rain\n- Drying time: 2-5 days depending on weather\n\n### Mechanical Drying\n- Use forced air dryers\n- Temperature: 43-50°C for maize\n- Monitor moisture content regularly\n\n## Storage Structures\n\n### Metal Silos\n- Airtight, rodent-proof\n- Capacity: 500-3000kg\n- Fumigate before sealing\n\n### Hermetic Bags (GrainPro)\n- Airtight plastic bags\n- Capacity: 50-100kg\n- No insect infestation possible\n\n### Traditional Granaries\n- Improved with raised platform\n- Rat guards on supports\n- Regular inspection needed\n\n## Storage Best Practices\n- Clean storage area before new harvest\n- Inspect grains regularly for pests\n- Store at cool temperature\n- Use natural repellents (neem, chili)\n- First-in, first-out for older stocks	10	N/A (post-harvest)	\N	\N	\N	Leaf	t	2026-06-22 09:28:43.691	2026-06-22 09:28:43.691
\.


--
-- Data for Name: IrrigationLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationLog" (id, "scheduleId", "farmerId", "startTime", "endTime", "durationMinutes", "waterUsedLiters", "waterSource", "triggerSource", status, "createdAt", action, "executedAt", reason, "triggeredBy", "zoneId") FROM stdin;
dca35a69-e237-47e9-b200-34cb5c9c4e70	f0354272-0bf6-4572-bf22-d156dd451da7	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	\N	25	396.00	\N	\N	completed	2026-06-22 09:28:43.013	START	2026-06-21 09:28:43.011	Scheduled irrigation	schedule	a12c993f-d4bd-4440-806c-0d06942f4c13
0e1c335b-ea72-4fcd-b546-cf2be26291df	ec75ed7d-1461-4edf-acfc-bba5d5c054d8	a22b0898-d778-4359-afbd-c141f1715707	\N	\N	25	453.00	\N	\N	completed	2026-06-22 09:28:43.042	START	2026-06-21 09:28:43.04	Scheduled irrigation	schedule	e019c994-8a23-47ce-99f4-a3d6bc49cb5d
94027700-adde-4846-946f-f4893873ada9	133e89bb-3202-4ead-8a82-0a23a2215b5e	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	\N	25	446.00	\N	\N	completed	2026-06-22 09:28:43.058	START	2026-06-21 09:28:43.056	Scheduled irrigation	schedule	e4492e49-ccaf-4c93-87fb-a98d4008fee0
a8ed2bf0-85c1-461f-a0f1-8739399b1816	56d380e0-30cb-41d6-bde4-afdec2889f95	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	\N	25	423.00	\N	\N	completed	2026-06-22 09:28:43.074	START	2026-06-21 09:28:43.072	Scheduled irrigation	schedule	babdc475-de28-447c-8be9-49353f5270ca
31679a2f-4426-4553-848b-61cd07ee2a04	1cae6f83-9b35-4b96-b91f-4fbbb413d61c	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	\N	25	455.00	\N	\N	completed	2026-06-22 09:28:43.091	START	2026-06-21 09:28:43.089	Scheduled irrigation	schedule	3b276872-1f98-4b2b-8562-cb481996d81a
17a69216-836a-4c45-baf4-fd7772b0eb50	b7247299-04e3-4bd9-a4bc-452fc3a4a771	18246537-c9fb-41a4-b94f-89944fff9c43	\N	\N	25	427.00	\N	\N	completed	2026-06-22 09:28:43.109	START	2026-06-21 09:28:43.107	Scheduled irrigation	schedule	7b4bbdf3-60d9-4094-aa19-6bef361d4fd7
08b93de6-be4e-4a30-9c38-f09b9c2df60c	d3a3aacd-715f-424d-8db5-d1c9e7f010a4	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	\N	25	331.00	\N	\N	completed	2026-06-22 09:28:43.123	START	2026-06-21 09:28:43.121	Scheduled irrigation	schedule	96cc7f6a-0789-4757-9dbb-6384ca2dbe2b
8db13c33-2402-4e30-87c6-332ea76f017d	3a3958a4-1bb3-49f9-92ff-3c0c2392af10	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	\N	25	330.00	\N	\N	completed	2026-06-22 09:28:43.139	START	2026-06-21 09:28:43.137	Scheduled irrigation	schedule	5d74e6ae-e500-43ae-91fa-73467e3deff7
7a4eac4d-b21f-479d-b1ca-637c8d5444b5	64bb4ff6-3025-4b7b-9c3a-0e52b993f70d	13065b12-d33e-4f5b-9200-772bea57226c	\N	\N	25	483.00	\N	\N	completed	2026-06-22 09:28:43.153	START	2026-06-21 09:28:43.151	Scheduled irrigation	schedule	13151b26-ded2-4fb8-9846-3ba4044f6b0b
67546f8b-02b0-4a17-ba04-d3933b11ce14	9d3a86b9-4b9b-4f89-89cd-99d85bbdc790	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	\N	25	517.00	\N	\N	completed	2026-06-22 09:28:43.166	START	2026-06-21 09:28:43.163	Scheduled irrigation	schedule	38727a29-9842-4ffa-98ca-4989510619cd
7ea83ffa-7e2e-4c2e-ad2e-238d65ad0a7c	8e65e7b0-5de6-438a-8045-2d4cdac606cf	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	\N	25	579.00	\N	\N	completed	2026-06-22 09:28:43.179	START	2026-06-21 09:28:43.176	Scheduled irrigation	schedule	076b2af5-90f1-4aed-a3e3-a2e384480537
9769a632-9d1d-444a-88b4-eed13488f116	9b543194-0440-4f54-a92f-07b622fc8a89	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	\N	25	582.00	\N	\N	completed	2026-06-22 09:28:43.191	START	2026-06-21 09:28:43.188	Scheduled irrigation	schedule	09b376ad-e58e-4930-a147-492e6635940b
374c07a0-4bcd-4073-aee9-c683880798cf	8c062107-e5b0-4df7-a2b6-5618ec1d0122	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	\N	25	529.00	\N	\N	completed	2026-06-22 09:28:43.201	START	2026-06-21 09:28:43.199	Scheduled irrigation	schedule	40fa213e-e939-4110-8e15-1e588e0505b2
2ffc3cb8-a581-498a-8cd3-1d42c8aed4eb	7c9b1e21-9ace-47c0-81e6-1ce0b375e369	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	\N	25	370.00	\N	\N	completed	2026-06-22 09:28:43.215	START	2026-06-21 09:28:43.213	Scheduled irrigation	schedule	a4b107a5-e114-406f-b92a-dd3f6f5a77ee
fdc690a8-1bc2-40e0-8614-825b8b080bde	aec41071-afcc-4de3-af6c-3e99dac2f237	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	\N	25	505.00	\N	\N	completed	2026-06-22 09:28:43.226	START	2026-06-21 09:28:43.225	Scheduled irrigation	schedule	675e9903-6352-4fe8-bf4d-239e550452ee
50191eb7-bcd2-4229-87ac-6fc88524a800	ef02571b-7a0c-4cc6-8eeb-50d3b48fd3b9	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	\N	25	522.00	\N	\N	completed	2026-06-22 09:28:43.238	START	2026-06-21 09:28:43.236	Scheduled irrigation	schedule	2af70698-0d59-45db-99c0-1a70791d5067
b3dd794d-69ff-421f-a591-9a73fe0097eb	f16ac664-ed91-49cc-9949-022e31cac5e2	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	\N	25	390.00	\N	\N	completed	2026-06-22 09:28:43.248	START	2026-06-21 09:28:43.246	Scheduled irrigation	schedule	96a3b3d0-36b7-4aba-857e-6cf901d4dd99
b2c31b8c-bc7f-497a-8ec7-f62a6854774d	83661c93-b95d-478f-b3e0-c8cf9d792a04	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	\N	25	456.00	\N	\N	completed	2026-06-22 09:28:43.26	START	2026-06-21 09:28:43.258	Scheduled irrigation	schedule	5545b29d-f470-49f4-927b-b2606b4d3f87
5db6e967-186a-4592-9cfa-b7e805e69a58	72ee72c7-0204-4fe8-98e9-cd5359be9013	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	\N	25	431.00	\N	\N	completed	2026-06-22 09:28:43.272	START	2026-06-21 09:28:43.27	Scheduled irrigation	schedule	6c419de2-674e-4662-9dbd-ec13a69c4046
3fc7025d-83ed-4976-870f-036bdd54a31c	aa860fc3-cfbb-4330-8be1-348eb2cac585	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	\N	25	555.00	\N	\N	completed	2026-06-22 09:28:43.299	START	2026-06-21 09:28:43.297	Scheduled irrigation	schedule	735c21ed-7adf-4860-9689-31550eb3824b
\.


--
-- Data for Name: IrrigationSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationSchedule" (id, "farmerId", "cropId", "scheduleType", "startTime", "durationMinutes", frequency, "daysOfWeek", "waterSource", "waterAmountLiters", "pumpEnabled", "valveEnabled", "isActive", "createdAt", "updatedAt") FROM stdin;
f0354272-0bf6-4572-bf22-d156dd451da7	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	daily	07:00	32	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:42.998	2026-06-22 09:28:42.998
ec75ed7d-1461-4edf-acfc-bba5d5c054d8	a22b0898-d778-4359-afbd-c141f1715707	\N	daily	06:00	26	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.036	2026-06-22 09:28:43.036
133e89bb-3202-4ead-8a82-0a23a2215b5e	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	daily	06:00	24	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.052	2026-06-22 09:28:43.052
56d380e0-30cb-41d6-bde4-afdec2889f95	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	daily	07:00	37	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.069	2026-06-22 09:28:43.069
1cae6f83-9b35-4b96-b91f-4fbbb413d61c	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	daily	07:00	20	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.085	2026-06-22 09:28:43.085
b7247299-04e3-4bd9-a4bc-452fc3a4a771	18246537-c9fb-41a4-b94f-89944fff9c43	\N	daily	07:00	32	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.103	2026-06-22 09:28:43.103
d3a3aacd-715f-424d-8db5-d1c9e7f010a4	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	daily	07:00	36	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.119	2026-06-22 09:28:43.119
3a3958a4-1bb3-49f9-92ff-3c0c2392af10	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	daily	05:00	27	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.134	2026-06-22 09:28:43.134
64bb4ff6-3025-4b7b-9c3a-0e52b993f70d	13065b12-d33e-4f5b-9200-772bea57226c	\N	daily	07:00	22	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.148	2026-06-22 09:28:43.148
9d3a86b9-4b9b-4f89-89cd-99d85bbdc790	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	daily	07:00	30	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.161	2026-06-22 09:28:43.161
8e65e7b0-5de6-438a-8045-2d4cdac606cf	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	daily	07:00	37	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.174	2026-06-22 09:28:43.174
9b543194-0440-4f54-a92f-07b622fc8a89	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	daily	06:00	34	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.186	2026-06-22 09:28:43.186
8c062107-e5b0-4df7-a2b6-5618ec1d0122	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	daily	07:00	25	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.197	2026-06-22 09:28:43.197
7c9b1e21-9ace-47c0-81e6-1ce0b375e369	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	daily	05:00	33	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.209	2026-06-22 09:28:43.209
aec41071-afcc-4de3-af6c-3e99dac2f237	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	daily	06:00	32	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.222	2026-06-22 09:28:43.222
ef02571b-7a0c-4cc6-8eeb-50d3b48fd3b9	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	daily	07:00	38	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.233	2026-06-22 09:28:43.233
f16ac664-ed91-49cc-9949-022e31cac5e2	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	daily	06:00	39	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.243	2026-06-22 09:28:43.243
83661c93-b95d-478f-b3e0-c8cf9d792a04	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	daily	07:00	30	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.254	2026-06-22 09:28:43.254
72ee72c7-0204-4fe8-98e9-cd5359be9013	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	daily	05:00	34	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.268	2026-06-22 09:28:43.268
aa860fc3-cfbb-4330-8be1-348eb2cac585	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	daily	05:00	36	daily	{1,2,3,4,5,6,7}	\N	\N	f	f	t	2026-06-22 09:28:43.294	2026-06-22 09:28:43.294
\.


--
-- Data for Name: IrrigationZone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."IrrigationZone" (id, "farmerId", name, "sizeHectares", "cropType", "soilType", "isActive", status, "lastIrrigated", "nextScheduled", "moistureLevel", temperature, "createdAt", "updatedAt") FROM stdin;
a12c993f-d4bd-4440-806c-0d06942f4c13	1ee83493-6d3b-4af0-8043-a90c91ccec18	Main Plot	1.80	maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:42.986	2026-06-22 09:28:42.986
e019c994-8a23-47ce-99f4-a3d6bc49cb5d	a22b0898-d778-4359-afbd-c141f1715707	Main Plot	1.30	potato	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.032	2026-06-22 09:28:43.032
e4492e49-ccaf-4c93-87fb-a98d4008fee0	4e540a68-eb3d-4333-8823-8633ed91c38c	Main Plot	2.10	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.049	2026-06-22 09:28:43.049
babdc475-de28-447c-8be9-49353f5270ca	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	Main Plot	1.00	coffee	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.064	2026-06-22 09:28:43.064
3b276872-1f98-4b2b-8562-cb481996d81a	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	Main Plot	1.50	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.082	2026-06-22 09:28:43.082
7b4bbdf3-60d9-4094-aa19-6bef361d4fd7	18246537-c9fb-41a4-b94f-89944fff9c43	Main Plot	0.80	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.1	2026-06-22 09:28:43.1
96cc7f6a-0789-4757-9dbb-6384ca2dbe2b	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	Main Plot	1.40	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.116	2026-06-22 09:28:43.116
5d74e6ae-e500-43ae-91fa-73467e3deff7	8b12ccf0-99ce-438a-ae92-9b0b128c5730	Main Plot	2.40	rice	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.128	2026-06-22 09:28:43.128
13151b26-ded2-4fb8-9846-3ba4044f6b0b	13065b12-d33e-4f5b-9200-772bea57226c	Main Plot	2.80	rice	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.144	2026-06-22 09:28:43.144
38727a29-9842-4ffa-98ca-4989510619cd	53953eec-9a9d-4622-9e22-d21cfc2c5fac	Main Plot	2.00	cassava	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.158	2026-06-22 09:28:43.158
076b2af5-90f1-4aed-a3e3-a2e384480537	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	Main Plot	1.10	cassava	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.17	2026-06-22 09:28:43.17
09b376ad-e58e-4930-a147-492e6635940b	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	Main Plot	1.50	tea	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.182	2026-06-22 09:28:43.182
40fa213e-e939-4110-8e15-1e588e0505b2	e36eab12-7f32-49ed-b873-6e12ed6989d5	Main Plot	1.30	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.194	2026-06-22 09:28:43.194
a4b107a5-e114-406f-b92a-dd3f6f5a77ee	a3b683e1-9442-4f93-b0b9-4832d347c431	Main Plot	1.60	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.206	2026-06-22 09:28:43.206
675e9903-6352-4fe8-bf4d-239e550452ee	9278c158-e722-496e-9ed2-bdd86b0b6500	Main Plot	2.20	coffee	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.219	2026-06-22 09:28:43.219
2af70698-0d59-45db-99c0-1a70791d5067	511325ec-4b9c-42a6-b67e-60ea0ed2db00	Main Plot	1.90	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.231	2026-06-22 09:28:43.231
96a3b3d0-36b7-4aba-857e-6cf901d4dd99	18d19df2-74c7-41f9-9bb8-26cce623f714	Main Plot	1.00	Maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.241	2026-06-22 09:28:43.241
5545b29d-f470-49f4-927b-b2606b4d3f87	ab9d4f3d-0948-4c99-b527-3274308c6778	Main Plot	0.80	beans	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.251	2026-06-22 09:28:43.251
6c419de2-674e-4662-9dbd-ec13a69c4046	8e0eaf5d-6919-4c79-bfad-593f6ce69101	Main Plot	0.60	maize	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.265	2026-06-22 09:28:43.265
735c21ed-7adf-4860-9689-31550eb3824b	32263c67-6a11-4e1e-ad26-c508b80de3f6	Main Plot	0.90	beans	\N	t	idle	\N	\N	\N	\N	2026-06-22 09:28:43.291	2026-06-22 09:28:43.291
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

COPY public."Notification" (id, "userId", title, message, channel, "sentAt", status, "createdAt", metadata, priority, type) FROM stdin;
\.


--
-- Data for Name: NotificationDelivery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NotificationDelivery" (id, "notificationId", channel, status, "deliveredAt", "failedAt", "failureReason") FROM stdin;
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
\.


--
-- Data for Name: PostReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostReport" (id, "postId", "userId", reason, "createdAt") FROM stdin;
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
3c0a22f7-0dbf-420b-a10a-efd37eb9827a	4ad72173-cf2f-4eb4-b82b-152bd06af352	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YWQ3MjE3My1jZjJmLTRlYjQtYjgyYi0xNTJiZDA2YWYzNTIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MjEzNDI2MCwiZXhwIjoxNzgyNzM5MDYwfQ.8uiNaZDqoq07gAHZNv6PnVgLuq0D6WdvqnQZ_2FuFkg	2026-06-29 13:17:40.145	2026-06-22 13:17:40.145
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

COPY public."Resource" (id, "cooperativeId", name, description, "resourceType", quantity, unit, "availableQuantity", condition, location, "isAvailable", "addedBy", "createdAt", "updatedAt", category, "expiryDate", "lastMaintenance", "minStockLevel", "nextMaintenance", status) FROM stdin;
17167c7c-94c6-4864-b16f-4dd451a1ccd8	96113786-9853-40a6-83f7-27b3d0750553	Tractor A1	John Deere 5075E for plowing	equipment	1.00	unit	1.00	\N	Musanze Warehouse	t	0b179914-3579-43c2-98db-214d86a7fb9d	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Machinery	\N	\N	20.00	\N	available
32709551-6454-499f-af01-a72735a63e59	29b880ab-18ce-498c-882a-23acc69e184d	Storage Silo 1	10-tonne grain storage silo	storage	1.00	unit	1.00	\N	Huye Warehouse	t	eec58320-9999-4995-bdb6-7ab6ec7355ed	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Infrastructure	\N	\N	20.00	\N	available
e96d9326-a741-4a5b-8a0b-941cd8c8dd69	77e18590-773b-4342-869c-8b24aaf6ae5f	Water Pump P1	Diesel water pump for irrigation	equipment	1.00	unit	1.00	\N	Bugesera Warehouse	t	c4e54841-ed79-492b-ba8a-a79905af15c0	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Machinery	\N	\N	20.00	\N	available
00d42735-2b68-45b5-9bea-0d9288f6e11e	5ae0ec04-591e-4049-a50d-8f7000cc7535	Seed Store	Certified seed storage facility	storage	1.00	unit	1.00	\N	Nyamasheke Warehouse	t	84408fed-0e60-410f-8012-42e6dc7b637b	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Infrastructure	\N	\N	20.00	\N	available
49a32438-d4db-457c-8c2f-df996f9dfcf0	2f8d90e6-4a3e-4402-9838-aca3e72d3469	Greenhouse G1	Seedling greenhouse 200m²	storage	1.00	unit	1.00	\N	Burera Warehouse	t	00e5003c-50c6-42a2-ba4b-60d56694abc7	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Infrastructure	\N	\N	20.00	\N	available
870e26dd-a731-4663-a8b5-e700949581c4	eb77e4b2-0772-4081-92b3-975c3001ce66	Harvester H1	Combine harvester for maize	equipment	1.00	unit	1.00	\N	Kayonza Warehouse	t	e86d1008-5e00-4fd8-b59c-0164ed59236e	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Machinery	\N	\N	20.00	\N	available
3a3d891e-5bab-45ca-8837-abcaf00ac30c	e5b64ae1-31cd-4742-8491-cfdc1ed6ddd3	Drip Kit D1	Drip irrigation kit 2 hectares	equipment	1.00	unit	1.00	\N	Ruhango Warehouse	t	aa1a9118-388f-42d0-abd0-0722f850b4bc	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Irrigation	\N	\N	20.00	\N	available
b9029b2e-1114-49af-97b6-0f454fc5b3f3	80dbe2cb-3baf-4de2-a1d8-b17c5e078d9f	Sprayer Unit B2	Motorised crop sprayer	equipment	1.00	unit	1.00	\N	Rubavu Warehouse	t	be2db5ae-6b47-411b-a05b-1c65178b79a6	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Equipment	\N	\N	20.00	\N	available
ad323476-495a-4bc5-b227-28a9abfb1cfc	ba35c499-df6a-4a50-87d8-ec90ed0532f0	Truck T1	Transport truck 3-tonne capacity	equipment	1.00	unit	1.00	\N	Nyamagabe Warehouse	t	10a766c3-4472-4469-8953-972f4fe92f09	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Logistics	\N	\N	20.00	\N	available
4d97b99b-27bb-49e4-adcb-1e5df9e9b698	7707179b-5295-4def-8c5f-5832a22845eb	Processing Unit P2	Coffee wet processing station	equipment	1.00	unit	1.00	\N	Rulindo Warehouse	t	a2bf77a0-ae44-4ca5-924f-f812e19f36f3	2026-06-22 09:28:41.878	2026-06-22 09:28:41.878	Processing	\N	\N	20.00	\N	available
\.


--
-- Data for Name: ResourceDistribution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ResourceDistribution" (id, "resourceId", "farmerId", "assignedById", quantity, unit, location, status, notes, "distributedAt", "returnedAt", "expectedReturn") FROM stdin;
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
ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	soil_moisture	SN-AG-CCEC18	\N	\N	\N	t	\N	94.00	\N	2026-06-22 09:28:42.654	\N
19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	soil_moisture	SN-AG-715707	\N	\N	\N	t	\N	87.00	\N	2026-06-22 09:28:42.697	\N
0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	soil_moisture	SN-AG-91C38C	\N	\N	\N	t	\N	71.00	\N	2026-06-22 09:28:42.715	\N
ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	soil_moisture	SN-AG-3DFA3F	\N	\N	\N	t	\N	72.00	\N	2026-06-22 09:28:42.731	\N
65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	soil_moisture	SN-AG-A362A8	\N	\N	\N	t	\N	63.00	\N	2026-06-22 09:28:42.749	\N
c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	soil_moisture	SN-AG-FF9C43	\N	\N	\N	t	\N	92.00	\N	2026-06-22 09:28:42.767	\N
db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	soil_moisture	SN-AG-AD19E9	\N	\N	\N	t	\N	92.00	\N	2026-06-22 09:28:42.781	\N
daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	soil_moisture	SN-AG-8C5730	\N	\N	\N	t	\N	80.00	\N	2026-06-22 09:28:42.801	\N
d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	soil_moisture	SN-AG-57226C	\N	\N	\N	t	\N	61.00	\N	2026-06-22 09:28:42.815	\N
502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	soil_moisture	SN-AG-2C5FAC	\N	\N	\N	t	\N	64.00	\N	2026-06-22 09:28:42.828	\N
17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	soil_moisture	SN-AG-C1F413	\N	\N	\N	t	\N	85.00	\N	2026-06-22 09:28:42.842	\N
4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	soil_moisture	SN-AG-B62ED9	\N	\N	\N	t	\N	81.00	\N	2026-06-22 09:28:42.856	\N
78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	soil_moisture	SN-AG-6989D5	\N	\N	\N	t	\N	99.00	\N	2026-06-22 09:28:42.87	\N
fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	soil_moisture	SN-AG-47C431	\N	\N	\N	t	\N	89.00	\N	2026-06-22 09:28:42.885	\N
0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	soil_moisture	SN-AG-0B6500	\N	\N	\N	t	\N	64.00	\N	2026-06-22 09:28:42.898	\N
006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	soil_moisture	SN-AG-D2DB00	\N	\N	\N	t	\N	72.00	\N	2026-06-22 09:28:42.913	\N
a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	soil_moisture	SN-AG-23F714	\N	\N	\N	t	\N	80.00	\N	2026-06-22 09:28:42.926	\N
ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	soil_moisture	SN-AG-8C6778	\N	\N	\N	t	\N	92.00	\N	2026-06-22 09:28:42.94	\N
50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	soil_moisture	SN-AG-E69101	\N	\N	\N	t	\N	60.00	\N	2026-06-22 09:28:42.956	\N
14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	soil_moisture	SN-AG-0DE3F6	\N	\N	\N	t	\N	95.00	\N	2026-06-22 09:28:42.972	\N
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
1de77a63-b4c4-468a-9b7c-a277c4b72b24	ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	28.00	18.00	\N	5.40	\N	\N	\N	\N	2026-06-22 07:28:42.666
df585cd7-9a9c-43c8-916d-741a666a1426	ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	32.00	18.80	\N	5.60	\N	\N	\N	\N	2026-06-22 09:28:42.666
0baa4810-dfe4-4f2a-bd47-ea9494bb092a	19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	35.00	21.00	\N	5.60	\N	\N	\N	\N	2026-06-22 07:28:42.7
7b45f4d6-cc0b-4ba5-95cf-383e626ac3fe	19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	40.00	22.20	\N	5.80	\N	\N	\N	\N	2026-06-22 09:28:42.7
0477e8af-7c44-453d-ae98-d2fe5011129f	0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	42.00	24.00	\N	5.70	\N	\N	\N	\N	2026-06-22 07:28:42.718
0a468a48-0b67-4e19-a87d-4af95e843cf1	0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	48.00	25.60	\N	5.90	\N	\N	\N	\N	2026-06-22 09:28:42.718
814e0dec-bd03-4781-9572-9351cbc8c7be	ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	49.00	27.00	\N	5.90	\N	\N	\N	\N	2026-06-22 07:28:42.734
d65fdb54-5cf9-492a-9711-a48e72b862bf	ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	56.00	29.00	\N	6.10	\N	\N	\N	\N	2026-06-22 09:28:42.734
2e0afac3-8422-4652-bfdd-4d9bdeea52b7	65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	56.00	30.00	\N	6.10	\N	\N	\N	\N	2026-06-22 07:28:42.753
ca422ef4-11fd-48a6-91c3-0369e1a92de1	65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	64.00	30.80	\N	6.30	\N	\N	\N	\N	2026-06-22 09:28:42.753
97d9c056-6da2-4438-a974-763555f8e9b1	c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	63.00	20.00	\N	6.30	\N	\N	\N	\N	2026-06-22 07:28:42.769
45ba9679-c032-4a15-ac8e-c447b0bf31a0	c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	67.00	21.20	\N	6.50	\N	\N	\N	\N	2026-06-22 09:28:42.769
f7f8836b-f0fb-4df4-ae93-dfe732a8eef4	db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	28.00	23.00	\N	6.40	\N	\N	\N	\N	2026-06-22 07:28:42.784
15481406-424b-4e9c-8573-78686cd423be	db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	33.00	24.60	\N	6.60	\N	\N	\N	\N	2026-06-22 09:28:42.784
2b27dbb9-b188-445e-a358-deb6348150a0	daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	35.00	26.00	\N	6.60	\N	\N	\N	\N	2026-06-22 07:28:42.803
48b0d298-1ecf-40be-b4a3-1f7ebd4a219f	daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	41.00	28.00	\N	6.80	\N	\N	\N	\N	2026-06-22 09:28:42.803
ded4cf40-2c72-4aca-a271-e8e54c252d8f	d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	42.00	29.00	\N	6.80	\N	\N	\N	\N	2026-06-22 07:28:42.818
ad0ff58c-0829-4bc6-a6cc-0bece7007cb7	d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	49.00	29.80	\N	7.00	\N	\N	\N	\N	2026-06-22 09:28:42.818
17416df4-6c32-4501-8516-9389ad32d05c	502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	49.00	19.00	\N	6.90	\N	\N	\N	\N	2026-06-22 07:28:42.831
f4c0577c-bc3f-4233-80e9-fc46f0f49102	502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	57.00	20.20	\N	7.10	\N	\N	\N	\N	2026-06-22 09:28:42.831
4b5a88b5-b990-4305-b05e-04915bc81114	17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	56.00	22.00	\N	7.10	\N	\N	\N	\N	2026-06-22 07:28:42.844
157ccb98-1bca-4944-a6d8-406a59af2050	17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	60.00	23.60	\N	7.30	\N	\N	\N	\N	2026-06-22 09:28:42.844
c40b7a19-6881-4ce4-8285-221248d2f4a6	4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	63.00	25.00	\N	5.50	\N	\N	\N	\N	2026-06-22 07:28:42.859
7eec772e-6286-4e6a-a2be-5175842ee465	4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	68.00	27.00	\N	5.70	\N	\N	\N	\N	2026-06-22 09:28:42.859
a9d9495f-1db1-4f2b-b7dc-0919ebb8b42d	78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	28.00	28.00	\N	5.60	\N	\N	\N	\N	2026-06-22 07:28:42.873
9a102b41-02dd-4bc4-b866-8cea521fbb76	78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	34.00	28.80	\N	5.80	\N	\N	\N	\N	2026-06-22 09:28:42.873
24b8f018-984e-48a3-914f-b28a43117bcd	fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	35.00	18.00	\N	5.80	\N	\N	\N	\N	2026-06-22 07:28:42.887
7853ba27-5a45-485e-bbea-7a34fa39e866	fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	42.00	19.20	\N	6.00	\N	\N	\N	\N	2026-06-22 09:28:42.887
4ea8c873-7e53-4bf7-a824-8d7ec041a8a3	0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	42.00	21.00	\N	6.00	\N	\N	\N	\N	2026-06-22 07:28:42.901
5e874832-daad-455c-8cc6-bb94cb9fa2a3	0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	50.00	22.60	\N	6.20	\N	\N	\N	\N	2026-06-22 09:28:42.901
42853802-c5cb-4679-8d39-b755144d8ea5	006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	49.00	24.00	\N	6.20	\N	\N	\N	\N	2026-06-22 07:28:42.915
b0c3465f-82bf-4621-aba6-9b8cbe09f6ab	006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	53.00	26.00	\N	6.40	\N	\N	\N	\N	2026-06-22 09:28:42.915
096ba09e-4e62-492f-afdd-188519eb5118	a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	56.00	27.00	\N	6.30	\N	\N	\N	\N	2026-06-22 07:28:42.929
05f250d8-744a-49fa-9847-bde8d9381c78	a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	61.00	27.80	\N	6.50	\N	\N	\N	\N	2026-06-22 09:28:42.929
146b73b0-3ab2-4a1b-97ab-ed0e652701c0	ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	63.00	30.00	\N	6.50	\N	\N	\N	\N	2026-06-22 07:28:42.944
d2b31ca2-7c97-49f2-a4e6-d8e4779ca6be	ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	69.00	31.20	\N	6.70	\N	\N	\N	\N	2026-06-22 09:28:42.944
dc950de2-62f4-4878-96f2-b4a4b4d7488f	50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	28.00	20.00	\N	6.70	\N	\N	\N	\N	2026-06-22 07:28:42.959
b74d8dc8-e1d3-48f6-87bf-7fdaca114073	50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	35.00	21.60	\N	6.90	\N	\N	\N	\N	2026-06-22 09:28:42.959
4779fa9a-001c-4192-b5fe-03c54215d2d0	14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	35.00	23.00	\N	6.80	\N	\N	\N	\N	2026-06-22 07:28:42.975
e6cf96d0-97f4-473e-9eea-b6ed529ca36d	14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	43.00	25.00	\N	7.00	\N	\N	\N	\N	2026-06-22 09:28:42.975
9753b89f-0207-4d83-8bf6-61322b5f5f42	ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	59.00	23.80	\N	5.97	37.00	43.00	218.00	\N	2026-06-22 12:39:49.234
78a9af00-573c-4cf0-a3d0-af16c388784a	19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	76.00	22.50	\N	6.24	31.00	35.00	224.00	\N	2026-06-22 12:39:49.296
d4de5066-136d-4ca1-a479-7111f4e647e9	0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	65.00	20.10	\N	7.07	58.00	49.00	182.00	\N	2026-06-22 12:39:49.31
9efa9561-6657-4a0a-becc-29072fc77860	ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	48.00	22.10	\N	6.87	26.00	26.00	210.00	\N	2026-06-22 12:39:49.32
6cfe24bc-93cd-4767-97d5-f8a2919c7323	65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	78.00	27.70	\N	7.21	60.00	46.00	201.00	\N	2026-06-22 12:39:49.33
1c5c94fe-60f8-438d-8703-7ec7db97b5e9	c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	76.00	25.90	\N	6.25	78.00	25.00	125.00	\N	2026-06-22 12:39:49.341
2466f8f2-3752-4b8f-b91b-6c87e82a8f28	db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	51.00	21.70	\N	5.56	57.00	30.00	160.00	\N	2026-06-22 12:39:49.353
bf6b659d-eb53-4d2c-be6c-6fe06e8b3397	daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	45.00	23.00	\N	7.49	33.00	33.00	100.00	\N	2026-06-22 12:39:49.364
10409b41-25aa-4d74-92dd-f73b47dfd5c0	d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	74.00	23.00	\N	5.53	51.00	26.00	234.00	\N	2026-06-22 12:39:49.373
4543cc8a-b96e-4366-a0aa-e7e8aef77a49	502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	70.00	21.50	\N	6.66	42.00	47.00	200.00	\N	2026-06-22 12:39:49.384
a6165bb8-6d18-4ac5-a2e3-16d55a7f49a0	17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	69.00	24.20	\N	6.24	26.00	31.00	199.00	\N	2026-06-22 12:39:49.394
a6f95c4f-cd99-4735-b30a-32eada11489a	4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	60.00	25.40	\N	7.43	73.00	28.00	215.00	\N	2026-06-22 12:39:49.408
b62578ed-76f8-4bcb-b0b2-d3ca14e9566b	78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	73.00	26.00	\N	6.80	39.00	13.00	138.00	\N	2026-06-22 12:39:49.421
3e593a8b-96c5-4956-b2bb-e9ad8b5b7c05	fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	48.00	22.70	\N	7.00	33.00	15.00	181.00	\N	2026-06-22 12:39:49.429
dcc9d20a-314a-4946-a7b2-781a4bda8163	0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	76.00	20.00	\N	6.72	43.00	27.00	127.00	\N	2026-06-22 12:39:49.447
f4d2f9a6-2d08-4f5e-9017-7db19acddfac	006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	63.00	28.00	\N	6.14	74.00	19.00	148.00	\N	2026-06-22 12:39:49.455
4fd06fa7-6f71-4693-b70b-fb6d97a37fac	a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	49.00	18.50	\N	7.23	46.00	37.00	237.00	\N	2026-06-22 12:39:49.467
88737adf-2a44-4674-abfc-c54c73aa1c78	ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	71.00	26.90	\N	6.37	27.00	12.00	202.00	\N	2026-06-22 12:39:49.477
1c257676-d490-4d06-b397-536a59731c75	50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	56.00	25.80	\N	6.99	22.00	27.00	197.00	\N	2026-06-22 12:39:49.492
d1777d2b-4df7-417d-b2eb-dcaba106c569	14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	52.00	23.30	\N	5.56	38.00	31.00	200.00	\N	2026-06-22 12:39:49.504
a8bd41af-37e3-4717-b456-fd81278ed58b	ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	73.00	28.00	\N	6.84	23.00	30.00	246.00	\N	2026-06-22 12:50:58.355
aee338e0-c1f1-4e0a-a191-8243277799c9	19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	74.00	18.10	\N	6.45	77.00	33.00	191.00	\N	2026-06-22 12:50:58.394
634932b1-ceb9-4d2c-a420-cbfb44caa490	0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	53.00	25.60	\N	5.87	66.00	37.00	202.00	\N	2026-06-22 12:50:58.407
d58f39aa-b2bc-47ff-b932-0ccf8f23e239	ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	63.00	20.50	\N	7.10	64.00	27.00	221.00	\N	2026-06-22 12:50:58.417
232a951b-b89f-435d-b498-c65d07a7028b	65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	54.00	22.60	\N	5.79	31.00	34.00	183.00	\N	2026-06-22 12:50:58.425
9e2fd38d-8436-4323-b47a-171b55f38aca	c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	72.00	23.30	\N	7.32	40.00	24.00	122.00	\N	2026-06-22 12:50:58.432
5ab165a0-807a-48ef-bc57-a3832b62b2e5	db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	69.00	21.80	\N	6.08	53.00	27.00	143.00	\N	2026-06-22 12:50:58.44
332c5ca8-da48-42f2-a899-98852d4db687	daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	64.00	27.70	\N	6.02	70.00	45.00	195.00	\N	2026-06-22 12:50:58.447
923f8c99-4b4d-4bc4-a677-98cf7776f303	d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	76.00	23.70	\N	6.75	32.00	26.00	227.00	\N	2026-06-22 12:50:58.456
a09a547c-b9fc-4f23-9037-9711856cb121	502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	73.00	26.60	\N	5.77	70.00	40.00	135.00	\N	2026-06-22 12:50:58.465
26cab7e6-295e-4453-8294-1c28e5c07be2	17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	60.00	23.50	\N	5.56	21.00	34.00	148.00	\N	2026-06-22 12:50:58.473
a6526e09-e1c2-4516-a7f9-2f4e184b66b3	4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	68.00	25.00	\N	7.33	70.00	45.00	160.00	\N	2026-06-22 12:50:58.481
115587e4-6fcc-471c-894d-461044720b41	78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	47.00	21.80	\N	6.83	49.00	20.00	187.00	\N	2026-06-22 12:50:58.489
595d93e6-1e4d-42b4-b04a-6197e7e5b22c	fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	79.00	21.00	\N	7.35	31.00	47.00	166.00	\N	2026-06-22 12:50:58.496
ee6f235b-391b-4d28-984d-f024acf2f314	0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	65.00	26.50	\N	6.34	62.00	43.00	172.00	\N	2026-06-22 12:50:58.505
d9edb519-eccc-414f-b88d-f695c65a1c18	006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	47.00	26.50	\N	5.64	37.00	39.00	217.00	\N	2026-06-22 12:50:58.522
d0759df4-b6e7-4281-9a1c-4776f18d7ae5	a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	58.00	22.70	\N	7.20	34.00	12.00	121.00	\N	2026-06-22 12:50:58.527
cbaf5d6c-747e-4c37-85d8-e928e762fc2c	ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	65.00	23.00	\N	6.77	79.00	38.00	218.00	\N	2026-06-22 12:50:58.535
58f6a330-6da8-4e60-bc36-779c7e1199ff	50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	49.00	22.40	\N	6.13	23.00	45.00	102.00	\N	2026-06-22 12:50:58.543
1f90d97e-9c28-45ee-8749-833b39bef5e7	14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	46.00	27.60	\N	7.39	77.00	27.00	119.00	\N	2026-06-22 12:50:58.554
189d5e31-0778-4f70-afe2-d49f10e5ae54	ec019fb3-0a6d-4148-83c1-3cbe6a0f6bab	1ee83493-6d3b-4af0-8043-a90c91ccec18	52.00	23.60	\N	5.79	30.00	46.00	156.00	\N	2026-06-22 13:05:53.456
2fe72971-18f4-4f8b-afba-bf8749953fec	19a0d069-0f0a-430f-8e64-7b721461ef5f	a22b0898-d778-4359-afbd-c141f1715707	80.00	21.80	\N	6.00	46.00	16.00	237.00	\N	2026-06-22 13:05:53.506
81168a1d-90b1-4ee4-b440-aeb0fa88673c	0c3f2788-f50f-43b5-9b84-4e23b4cab732	4e540a68-eb3d-4333-8823-8633ed91c38c	64.00	21.00	\N	6.42	64.00	46.00	143.00	\N	2026-06-22 13:05:53.516
e9a9115e-5de8-49ba-b2f9-3b5f1d49937d	ecf82ce8-d121-45b5-bbcd-61abfee5b80e	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	62.00	23.10	\N	6.14	24.00	33.00	186.00	\N	2026-06-22 13:05:53.525
b8f9d083-fb5e-4e10-af55-059f76c1c35a	65d14ac6-c135-4553-816c-2cc0816778de	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	61.00	22.30	\N	5.88	36.00	47.00	150.00	\N	2026-06-22 13:05:53.534
a3f152da-dcd0-4ea7-b879-ebcb9603cded	c34bf105-7f8e-4440-a06d-d421aaafa11c	18246537-c9fb-41a4-b94f-89944fff9c43	52.00	24.80	\N	6.25	29.00	15.00	237.00	\N	2026-06-22 13:05:53.544
9b9546f1-4535-4b72-b124-cce5a31db960	db3a77db-56ae-4f0a-8cfb-1a65c68cf50d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	56.00	27.30	\N	5.52	27.00	14.00	118.00	\N	2026-06-22 13:05:53.554
b7010216-09f4-4f64-91d6-2e63fa4a2f7e	daf5612e-805e-485d-b6ea-c90ed4a450a6	8b12ccf0-99ce-438a-ae92-9b0b128c5730	49.00	21.60	\N	7.40	22.00	30.00	112.00	\N	2026-06-22 13:05:53.563
afef1d0c-51e8-4339-bbf3-4eebecf219bc	d9cedec7-126c-45ec-aef5-957deb837614	13065b12-d33e-4f5b-9200-772bea57226c	49.00	23.80	\N	7.30	36.00	26.00	228.00	\N	2026-06-22 13:05:53.571
61bbb6bf-2230-4c32-bb4d-0fade7461685	502bc0fe-a43e-45a3-8729-ddbbaabe775e	53953eec-9a9d-4622-9e22-d21cfc2c5fac	63.00	20.70	\N	5.74	26.00	36.00	186.00	\N	2026-06-22 13:05:53.581
68bc7972-690e-42ad-a009-907403cd8f54	17b0264d-0189-4b19-a5ca-f160fbae728f	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	46.00	19.60	\N	6.30	80.00	12.00	195.00	\N	2026-06-22 13:05:53.589
b8dff073-d6cf-4e69-b7f0-29b351b0bf74	4dfe5d30-d579-4acc-9cb4-0d6b48220f57	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	65.00	25.70	\N	5.93	50.00	10.00	107.00	\N	2026-06-22 13:05:53.597
f02e4fa7-efb5-4c38-b0d7-e1de72dd64bc	78f81cd6-db6c-4479-abb1-1f3789651c6c	e36eab12-7f32-49ed-b873-6e12ed6989d5	64.00	20.40	\N	6.11	65.00	23.00	213.00	\N	2026-06-22 13:05:53.605
0e91591a-bf46-486f-8dcb-bd188dda8587	fc89515d-9c22-439f-b1b6-26be39094cd0	a3b683e1-9442-4f93-b0b9-4832d347c431	77.00	23.50	\N	7.27	36.00	27.00	115.00	\N	2026-06-22 13:05:53.614
2ca88299-5a04-4317-b0ff-15d8f5e37448	0df1283a-c508-4ab6-81b1-30eb4aef1aba	9278c158-e722-496e-9ed2-bdd86b0b6500	79.00	18.40	\N	7.35	63.00	14.00	208.00	\N	2026-06-22 13:05:53.622
02ad0710-c538-4c03-bf9a-7953db6a6aab	006146fb-66ee-43db-b219-78e6b3afe639	511325ec-4b9c-42a6-b67e-60ea0ed2db00	53.00	23.80	\N	6.76	53.00	23.00	206.00	\N	2026-06-22 13:05:53.63
f36243df-baca-45e3-b06d-b7050c5847f2	a641c369-010a-4505-a797-2ab887995716	18d19df2-74c7-41f9-9bb8-26cce623f714	73.00	27.00	\N	6.55	43.00	16.00	154.00	\N	2026-06-22 13:05:53.638
69aba831-4389-4c64-9648-ca10d45ec9cf	ed820ec2-fc04-4aac-96a9-24f0e0bced80	ab9d4f3d-0948-4c99-b527-3274308c6778	78.00	22.80	\N	5.92	40.00	14.00	150.00	\N	2026-06-22 13:05:53.648
92fa11e4-81b1-4a85-bb15-6698ccabc5c7	50d3839f-3739-4b83-b2bc-9597107f7fc2	8e0eaf5d-6919-4c79-bfad-593f6ce69101	74.00	26.30	\N	6.30	38.00	19.00	229.00	\N	2026-06-22 13:05:53.656
aa07bf25-67cb-453b-a1ef-633719bc1fac	14a51e19-5efe-455e-914f-b41a7d52ca37	32263c67-6a11-4e1e-ad26-c508b80de3f6	75.00	26.90	\N	6.33	59.00	14.00	135.00	\N	2026-06-22 13:05:53.665
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
5c55eaaa-553b-4407-a28c-e9e81b4bdf25	api	healthy	2.00	12828	0	2026-06-22 13:18:01.028
dd07e9db-9df9-4033-a537-8021e3ea1751	database	connected	100.00	0	0	2026-06-22 13:18:01.038
c63c91ae-a35f-4f31-b5fe-4467abd5811b	sensors	healthy	100.00	0	0	2026-06-22 13:18:01.04
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSetting" (key, value, description, "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, phone, email, "passwordHash", role, language, status, "isActive", "createdAt", "updatedAt", "avatarUrl", cell, "deletedAt", district, "fullName", "hasMarketAccess", "hasSensorAccess", "isApproved", "isOnboarded", province, "quietHoursEnd", "quietHoursStart", "requiresPasswordChange", sector, "serviceAccessExpiresAt", "subscriptionExpiresAt", "subscriptionType", village) FROM stdin;
4ad72173-cf2f-4eb4-b82b-152bd06af352	250780000001	superadmin@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	super_admin	kinyarwanda	active	t	2026-06-22 09:28:40.777	2026-06-22 09:28:40.777	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
4be9ef4d-ee89-4a07-8aab-18d08e3b5f55	250780000002	admin@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	admin	kinyarwanda	active	t	2026-06-22 09:28:40.807	2026-06-22 09:28:40.807	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
abb2f210-3dbc-4232-bde5-a9ed05c764ad	250780000003	officer1@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	officer	kinyarwanda	active	t	2026-06-22 09:28:40.92	2026-06-22 09:28:40.92	\N	\N	\N	\N	Umujyanama Mukamana	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
8461c70a-3ec6-4969-b0e3-682b33d0efc4	250780000004	officer2@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	officer	kinyarwanda	active	t	2026-06-22 09:28:40.944	2026-06-22 09:28:40.944	\N	\N	\N	\N	Eric Ndayisaba	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
0b179914-3579-43c2-98db-214d86a7fb9d	250788200001	manager.kinigi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.732	2026-06-22 09:28:41.732	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
be2db5ae-6b47-411b-a05b-1c65178b79a6	250788200002	manager.rubavu@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.747	2026-06-22 09:28:41.747	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
eec58320-9999-4995-bdb6-7ab6ec7355ed	250788200003	manager.huye@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.748	2026-06-22 09:28:41.748	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
c4e54841-ed79-492b-ba8a-a79905af15c0	250788200004	manager.bugesera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.749	2026-06-22 09:28:41.749	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
e86d1008-5e00-4fd8-b59c-0164ed59236e	250788200005	manager.kayonza@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.75	2026-06-22 09:28:41.75	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
84408fed-0e60-410f-8012-42e6dc7b637b	250788200006	manager.nyamasheke@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.753	2026-06-22 09:28:41.753	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
00e5003c-50c6-42a2-ba4b-60d56694abc7	250788200007	manager.burera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.754	2026-06-22 09:28:41.754	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
10a766c3-4472-4469-8953-972f4fe92f09	250788200008	manager.nyamagabe@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.756	2026-06-22 09:28:41.756	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
aa1a9118-388f-42d0-abd0-0722f850b4bc	250788200009	manager.ruhango@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.758	2026-06-22 09:28:41.758	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
a2bf77a0-ae44-4ca5-924f-f812e19f36f3	250788200010	manager.rulindo@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	cooperative	kinyarwanda	active	t	2026-06-22 09:28:41.76	2026-06-22 09:28:41.76	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
50e518eb-202f-40d2-aebe-9fccc78c1574	250788300001	jean.habimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.012	2026-06-22 09:28:42.012	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
dd2c95fa-b680-43dd-97c8-d6b4e2ee3ad6	250788300002	solange.uwimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.053	2026-06-22 09:28:42.053	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
9fd36cce-c67a-4ca6-9f13-42fac6040ba3	250788300003	celestin.bizimana@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.077	2026-06-22 09:28:42.077	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
3178036f-6cc2-42a2-90eb-39e77f1d4948	250788300004	claudine.mukand@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.102	2026-06-22 09:28:42.102	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
44570b40-1306-48d3-9ad8-c7e35d6d1bb2	250788300005	theophile.ntu@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.126	2026-06-22 09:28:42.126	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
3c1d241f-8e44-4593-92c7-71c43bef6321	250788300006	immacule.uwera@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.152	2026-06-22 09:28:42.152	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
029ce168-ede8-4570-ac71-53ec67f39c88	250788300007	evariste.nzig@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.173	2026-06-22 09:28:42.173	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
95119af2-ae90-48fb-bcd0-a763edc93fb9	250788300008	vestine.nkusi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.193	2026-06-22 09:28:42.193	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
f8d3d0f4-5b69-45a6-9db2-cc74e65422ac	250788300009	patrice.mugabo@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.221	2026-06-22 09:28:42.221	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
63a0964b-1e2c-4966-abeb-43032ad4ffaa	250788300010	domitille.uwim@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.24	2026-06-22 09:28:42.24	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
7f287c02-3229-4b17-a27f-2e6a49bb3507	250788300011	alexis.mugenzi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.26	2026-06-22 09:28:42.26	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
70706fa6-97bb-4fc0-9394-46bc5adb42bf	250788300012	chantal.nkuru@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.281	2026-06-22 09:28:42.281	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
02efc48d-6321-4825-b58c-f989211ac79f	250788300013	felix.rutageng@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.305	2026-06-22 09:28:42.305	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
43a7bb8a-4c05-432c-991a-5038aad70909	250788300014	fidele.nshimi@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.325	2026-06-22 09:28:42.325	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
497693e3-4f8c-45a5-8ab8-729a55e6bddf	250788300015	odette.ingab@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.346	2026-06-22 09:28:42.346	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
1edd5ee4-8d47-4db9-ae92-d3bbdd2296d2	250788300016	theogene.mug@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.366	2026-06-22 09:28:42.366	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
cd460fd5-ba86-4951-88ee-3e344de3baf4	250788300017	jeanpaul.hab@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.385	2026-06-22 09:28:42.385	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
4fa4a9ac-cd16-4a35-ab3c-7478f39904d7	250788300018	yvonne.mutuy@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.403	2026-06-22 09:28:42.403	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
19670a70-2d65-43e3-923a-6da876390c95	250788300019	gabriel.niyonz@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.427	2026-06-22 09:28:42.427	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
208a4b6a-5544-4d1f-a332-36a2c2251a50	250788300020	alice.nyira@aguka.rw	$argon2id$v=19$m=65536,t=3,p=4$f/daMWE2zpY0VA/K4dpjfg$0Vwh2Z61bXO1nYGaVXyxwIzY1nvDSA/D4Oyak8hy2Ho	farmer	kinyarwanda	active	t	2026-06-22 09:28:42.445	2026-06-22 09:28:42.445	\N	\N	\N	\N	\N	f	f	t	f	\N	\N	\N	f	\N	\N	\N	free	\N
\.


--
-- Data for Name: WeatherReading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WeatherReading" (id, "farmerId", "weatherStationId", "temperatureCelsius", "humidityPercent", "rainfallMm", "windSpeedKmh", "windDirection", "pressureHpa", "uvIndex", "solarRadiationWm2", forecast24hr, forecast7day, "readingAt") FROM stdin;
f589dcd4-3018-49b0-aaf5-d185a83d3490	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	20.00	52.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.683
a008731e-1b9f-4bb2-a145-6ad97c329a47	a22b0898-d778-4359-afbd-c141f1715707	\N	23.00	57.00	1.70	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.707
20970f47-ec7f-444d-b455-743f8f284eba	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	26.00	62.00	3.40	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.725
4f1fbcb8-5b97-4b90-bdf8-24e83ee868ec	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	29.00	67.00	5.10	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.74
97976e6f-bb59-4cd6-a461-d65ef5327d79	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	32.00	72.00	6.80	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.758
c1a73691-d02d-4ee9-9c06-9fc843ad4fbc	18246537-c9fb-41a4-b94f-89944fff9c43	\N	22.00	77.00	8.50	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.775
1c1b5a29-6cfa-4061-a68f-d4ec4eb35c65	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	25.00	82.00	10.20	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.795
ac1cbb71-ed3c-407c-8d65-d11e207b81b5	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	28.00	53.00	11.90	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.808
29df9b43-716b-406b-8762-7ca9c63d8132	13065b12-d33e-4f5b-9200-772bea57226c	\N	31.00	58.00	1.60	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.823
11a6393a-9be5-4850-a863-47141f06498c	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	21.00	63.00	3.30	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.836
18ba5e11-e7f0-463f-a3dc-442294e3b08c	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	24.00	68.00	5.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.849
e8f13adb-53d8-4140-94db-78bcc4b548a9	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	27.00	73.00	6.70	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.864
6f4c13d6-02ab-4f27-bd04-e48023c4e5c5	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	30.00	78.00	8.40	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.879
d5e690a8-e544-405d-aac9-fd87c3b3c390	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	20.00	83.00	10.10	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.894
27189199-0867-4ed2-83c8-943a15a9a532	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	23.00	54.00	11.80	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.906
1454cc31-e8f7-493e-9443-c392962d8821	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	26.00	59.00	1.50	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.921
62acf74d-4de3-4811-ad83-e5d865433c2f	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	29.00	64.00	3.20	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.935
673a2766-a34c-49a8-b5e3-0fd765a07d04	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	32.00	69.00	4.90	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.95
d5f7c485-b3a2-46e0-a2db-6a197f6e0c47	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	22.00	74.00	6.60	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.966
19d377ee-22fd-428c-b877-7aeaf96af544	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	25.00	79.00	8.30	\N	\N	\N	\N	\N	\N	\N	2026-06-22 09:28:42.98
f102379f-df83-413b-adcb-6808248b5e46	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	22.30	60.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.285
18e72117-ccc5-4cec-af2d-5b84c385e730	a22b0898-d778-4359-afbd-c141f1715707	\N	24.20	50.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.302
e7295ab1-affc-4ab9-b997-ec896634ea7e	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	22.80	58.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.315
2fb0d881-8a0e-4643-82f4-4a1a76852212	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	20.80	59.00	10.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.324
b73c318d-7ad1-4c93-b5c7-56b97ea8e4e1	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	26.40	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.336
b295d581-adc4-4675-a8ab-0ebeef83ac93	18246537-c9fb-41a4-b94f-89944fff9c43	\N	22.10	78.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.347
5cac64a9-fd1e-4547-9b72-6aa08f22a44d	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	22.00	63.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.359
3a6efd3a-d1ce-44b5-b4de-8d343c0951cb	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	20.30	55.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.368
030abe09-6f0b-4c61-9b04-edab18834ef3	13065b12-d33e-4f5b-9200-772bea57226c	\N	24.00	50.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.379
6557e58d-5916-4501-bd86-5085f14438eb	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	21.60	59.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.387
23ca3808-980c-4064-95ec-5dce94b3466a	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	20.90	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.403
5fccd61e-419f-461e-9bf2-4b6e315716ed	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	22.70	62.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.417
71cea252-ab2b-4ade-b2d5-a475c28104c0	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	23.90	79.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.424
3408b1ed-93ac-4566-9894-4782bcbb6270	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	23.50	50.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.436
c1e319f3-0609-4206-bf23-1a485de2fefe	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	26.80	75.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.45
26bc340e-463c-423c-a40b-9bc53a80c40c	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	24.90	78.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.458
1bdd3d04-76f9-4761-ae41-aa547f572897	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	21.30	54.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.472
5c490b7f-6484-4562-a576-b178c16286c2	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	23.10	77.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.488
7dd59a5c-bd76-4cc5-ae7d-78de51ac4e9d	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	21.60	76.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.497
44740e86-eadb-4c8c-86cc-ddbe7fe27935	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	25.60	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:39:49.507
3130b542-cf07-4b03-a473-85baa3f6cbb2	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	26.60	70.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.384
7ec6a464-78a7-4867-9ced-4cde122f4269	a22b0898-d778-4359-afbd-c141f1715707	\N	20.20	52.00	3.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.399
da7909e5-15c8-4927-bb7b-e7ed4a24ce01	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	24.30	52.00	7.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.412
6373a105-0c47-454b-9300-e05367a54a68	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	22.80	64.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.42
3fe1481a-a62b-442c-a229-f68ffed17418	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	27.60	51.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.427
795dc100-91a7-48bc-8318-77da33243023	18246537-c9fb-41a4-b94f-89944fff9c43	\N	27.90	51.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.436
7f17c924-61e4-457a-8e09-3da0993d65bf	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	24.30	58.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.443
cec4a6ef-b7f0-4de4-ad0d-f300d93c77e8	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	26.40	63.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.451
dd3931ae-1e87-4d18-9b42-fc69e2b8e874	13065b12-d33e-4f5b-9200-772bea57226c	\N	27.70	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.459
093ce2e3-393e-47f6-8451-4b49fd1dc194	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	28.00	72.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.468
16efcfa3-40a7-4ec0-85e2-592387299d01	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	21.70	52.00	7.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.476
88f6af62-d8a9-4440-bfb2-ea58d9fca5ac	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	27.60	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.484
e2cba450-1677-4ed3-b097-44d99df86ffc	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	20.80	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.492
29c2aefd-fe6e-4106-82d2-e1fd32fe715a	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	20.70	77.00	4.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.499
7b5f0b1f-683d-44b9-8d90-24cfefc6a6e8	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	20.40	51.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.508
6cd282a1-5d91-49e4-ab14-bfd90f03010b	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	25.70	51.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.524
3285daa7-4a3e-40dd-bf70-fffa578108af	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	24.20	62.00	1.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.53
813d4fd8-0651-4363-a329-7d9b87da3d49	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	22.20	79.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.538
24e72398-b3c3-4b8f-b983-10d17b305e01	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	21.50	71.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.546
ca761853-0b2b-45c0-9613-4929019282cd	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	25.30	57.00	7.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 12:50:58.556
eefca7e6-7d0e-41c3-9b2b-7861d9d1ca8d	1ee83493-6d3b-4af0-8043-a90c91ccec18	\N	21.30	58.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.471
e595e0a9-67e7-490e-a6f4-adc9fa0880c7	a22b0898-d778-4359-afbd-c141f1715707	\N	26.20	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.509
bc6d387e-3704-40c4-89f7-1b6450045032	4e540a68-eb3d-4333-8823-8633ed91c38c	\N	22.00	76.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.52
56d87586-8a69-40f2-9e77-80512fc2e50f	fb898bbe-36d3-40cb-b6e7-acff7b3dfa3f	\N	27.10	69.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.528
b7222851-7d4a-4dc6-b8a9-f7f61a740d7c	0ad1c8e4-0970-4ce2-b059-b31f84a362a8	\N	25.00	59.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.538
a5e09948-9ed3-432e-a3b0-88d32284fca1	18246537-c9fb-41a4-b94f-89944fff9c43	\N	22.40	53.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.549
1e3ecafd-72b2-44fe-b115-0a56f6b6f308	d00afc33-1f50-4dfc-8ffa-a1f6e8ad19e9	\N	23.40	55.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.558
c9e76811-eb85-4bb4-8090-c93ad83ce748	8b12ccf0-99ce-438a-ae92-9b0b128c5730	\N	23.90	61.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.566
979097f4-4013-4604-a0d3-26a3daad59cd	13065b12-d33e-4f5b-9200-772bea57226c	\N	27.10	69.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.575
77e446b5-afc5-48d3-bb95-1717f04840c8	53953eec-9a9d-4622-9e22-d21cfc2c5fac	\N	23.20	59.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.584
ecc1d336-6167-4f0c-8602-a681d9847ff4	ff1996f2-0215-4c3b-ba26-0e1c1bc1f413	\N	26.80	57.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.592
f38b7467-4492-4893-899f-2a93f16d3246	193fdb31-c1e1-4eb3-a3c6-df8866b62ed9	\N	26.20	57.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.601
1b0a21dc-9f35-4619-b220-28d65f25baa0	e36eab12-7f32-49ed-b873-6e12ed6989d5	\N	20.70	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.609
60ab4480-998a-4d53-a149-f59004a79d68	a3b683e1-9442-4f93-b0b9-4832d347c431	\N	21.90	79.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.617
d10c6ba7-2d4a-4125-9c57-8f679b6edbd9	9278c158-e722-496e-9ed2-bdd86b0b6500	\N	21.00	73.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.625
58450ab0-3d65-4202-a92e-626b11fb5fa8	511325ec-4b9c-42a6-b67e-60ea0ed2db00	\N	27.50	71.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.633
bd4ca615-9e86-4f33-8854-e5a83856087d	18d19df2-74c7-41f9-9bb8-26cce623f714	\N	25.80	78.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.642
7b187e7b-6bef-4699-b7c5-3d53b77e01be	ab9d4f3d-0948-4c99-b527-3274308c6778	\N	20.80	55.00	7.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.651
fa12829c-b7e9-417b-a910-7d1e34b42281	8e0eaf5d-6919-4c79-bfad-593f6ce69101	\N	24.50	80.00	0.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.66
392ccfc5-4d5a-4817-abf4-3e99576419e7	32263c67-6a11-4e1e-ad26-c508b80de3f6	\N	23.90	69.00	9.00	\N	\N	\N	\N	\N	\N	\N	2026-06-22 13:05:53.668
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
959b6d32-9486-4d61-a859-b30a99064913	54766763e24f3092fd1aa960bd863d002bc16875d249101baeb19fe956e70900	2026-06-22 11:39:03.695365+02	20260622093817_baseline_full_schema		\N	2026-06-22 11:39:03.695365+02	0
\.


--
-- Data for Name: feature_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feature_flags (id, key, enabled, description, updated_by, updated_at) FROM stdin;
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
-- Name: ResourceDistribution ResourceDistribution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDistribution"
    ADD CONSTRAINT "ResourceDistribution_pkey" PRIMARY KEY (id);


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
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


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
-- Name: Crop_nameEn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Crop_nameEn_key" ON public."Crop" USING btree ("nameEn");


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
-- Name: ResourceDistribution_assignedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDistribution_assignedById_idx" ON public."ResourceDistribution" USING btree ("assignedById");


--
-- Name: ResourceDistribution_farmerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDistribution_farmerId_idx" ON public."ResourceDistribution" USING btree ("farmerId");


--
-- Name: ResourceDistribution_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDistribution_resourceId_idx" ON public."ResourceDistribution" USING btree ("resourceId");


--
-- Name: ResourceDistribution_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ResourceDistribution_status_idx" ON public."ResourceDistribution" USING btree (status);


--
-- Name: Resource_cooperativeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_cooperativeId_idx" ON public."Resource" USING btree ("cooperativeId");


--
-- Name: Resource_resourceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_resourceType_idx" ON public."Resource" USING btree ("resourceType");


--
-- Name: Resource_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_status_idx" ON public."Resource" USING btree (status);


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
-- Name: Certificate Certificate_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."FarmerProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Certificate Certificate_officerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Certificate"
    ADD CONSTRAINT "Certificate_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ResourceDistribution ResourceDistribution_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDistribution"
    ADD CONSTRAINT "ResourceDistribution_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceDistribution ResourceDistribution_farmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDistribution"
    ADD CONSTRAINT "ResourceDistribution_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ResourceDistribution ResourceDistribution_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ResourceDistribution"
    ADD CONSTRAINT "ResourceDistribution_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

