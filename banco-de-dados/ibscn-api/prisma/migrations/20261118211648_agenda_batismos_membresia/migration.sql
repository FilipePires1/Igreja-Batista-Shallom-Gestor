-- AlterTable
ALTER TABLE "Sector" ADD COLUMN "cargos" TEXT;
ALTER TABLE "Sector" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Sector" ADD COLUMN "foundedAt" TEXT;
ALTER TABLE "Sector" ADD COLUMN "mission" TEXT;
ALTER TABLE "Sector" ADD COLUMN "notes" TEXT;
ALTER TABLE "Sector" ADD COLUMN "vision" TEXT;
ALTER TABLE "Sector" ADD COLUMN "whatsappLink" TEXT;

-- CreateTable
CREATE TABLE "BaptismRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT,
    "name" TEXT NOT NULL,
    "motherName" TEXT,
    "fatherName" TEXT,
    "birthdate" TEXT,
    "maritalStatus" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "birthplace" TEXT,
    "email" TEXT,
    "profession" TEXT,
    "education" TEXT,
    "address" TEXT,
    "zipCode" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "residencePhone" TEXT,
    "cellPhone" TEXT,
    "conversionDate" TEXT,
    "baptismDate" TEXT,
    "spouseName" TEXT,
    "previouslyMarried" TEXT,
    "civilMarriageDate" TEXT,
    "religiousMarriageDate" TEXT,
    "children" TEXT,
    "notes" TEXT,
    "signature" TEXT,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "BaptismRecord_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectorLeader" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SectorLeader_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SectorLeader_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectorIndication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectorId" TEXT NOT NULL,
    "personId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "year" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INDICADO',
    "notes" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SectorIndication_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SectorIndication_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeetingMinute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ASSEMBLEIA',
    "date" TEXT NOT NULL,
    "timeStart" TEXT,
    "location" TEXT,
    "president" TEXT,
    "secretary" TEXT,
    "attendees" INTEGER,
    "agenda" TEXT,
    "body" TEXT NOT NULL,
    "decisions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT
);

-- CreateTable
CREATE TABLE "EventTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CampusSpace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER,
    "color" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "subtype" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "bannerUrl" TEXT,
    "date" TEXT NOT NULL,
    "timeStart" TEXT NOT NULL,
    "timeEnd" TEXT,
    "location" TEXT,
    "address" TEXT,
    "mapsUrl" TEXT,
    "liveUrl" TEXT,
    "capacity" INTEGER,
    "sectorId" TEXT,
    "responsibleId" TEXT,
    "liturgicCycle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdById" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Event_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("address", "bannerUrl", "capacity", "createdAt", "createdById", "date", "description", "id", "isPublic", "liturgicCycle", "liveUrl", "location", "mapsUrl", "responsibleId", "sectorId", "status", "subtype", "tags", "timeEnd", "timeStart", "title", "type", "updatedAt") SELECT "address", "bannerUrl", "capacity", "createdAt", "createdById", "date", "description", "id", "isPublic", "liturgicCycle", "liveUrl", "location", "mapsUrl", "responsibleId", "sectorId", "status", "subtype", "tags", "timeEnd", "timeStart", "title", "type", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "preferredName" TEXT,
    "photoUrl" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "birthdate" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "motherName" TEXT,
    "fatherName" TEXT,
    "sex" TEXT,
    "maritalStatus" TEXT,
    "rg" TEXT,
    "birthplace" TEXT,
    "profession" TEXT,
    "education" TEXT,
    "zipCode" TEXT,
    "neighborhood" TEXT,
    "residencePhone" TEXT,
    "conversionDate" TEXT,
    "spouseName" TEXT,
    "previouslyMarried" TEXT,
    "civilMarriageDate" TEXT,
    "religiousMarriageDate" TEXT,
    "children" TEXT,
    "previousChurches" TEXT,
    "lastChurch" TEXT,
    "previousPastorContact" TEXT,
    "previousChurchAddress" TEXT,
    "ministryInterest" TEXT,
    "interviewedBy" TEXT,
    "homeVisitDate" TEXT,
    "membershipNotes" TEXT,
    "membershipRecordNumber" TEXT,
    "membershipRequestStatus" TEXT,
    "membershipRequestDate" TEXT,
    "baptismPlace" TEXT,
    "baptismPastor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "memberSince" TEXT,
    "baptismDate" TEXT,
    "baptismWaters" TEXT,
    "howFound" TEXT,
    "pastoralNotes" TEXT,
    "wantsContact" BOOLEAN NOT NULL DEFAULT false,
    "acceptsNews" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "createdById" TEXT
);
INSERT INTO "new_Person" ("acceptsNews", "address", "baptismDate", "baptismWaters", "birthdate", "city", "cpf", "createdAt", "createdById", "email", "howFound", "id", "memberSince", "name", "pastoralNotes", "phone", "photoUrl", "preferredName", "state", "status", "updatedAt", "wantsContact", "whatsapp") SELECT "acceptsNews", "address", "baptismDate", "baptismWaters", "birthdate", "city", "cpf", "createdAt", "createdById", "email", "howFound", "id", "memberSince", "name", "pastoralNotes", "phone", "photoUrl", "preferredName", "state", "status", "updatedAt", "wantsContact", "whatsapp" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE UNIQUE INDEX "Person_cpf_key" ON "Person"("cpf");
CREATE TABLE "new_SectorMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "personId" TEXT,
    "sectorId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "position" TEXT,
    "positions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TEXT NOT NULL DEFAULT '',
    "addedById" TEXT NOT NULL,
    CONSTRAINT "SectorMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SectorMember_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SectorMember_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SectorMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SectorMember" ("addedById", "id", "joinedAt", "personId", "roleId", "sectorId", "status", "userId") SELECT "addedById", "id", "joinedAt", "personId", "roleId", "sectorId", "status", "userId" FROM "SectorMember";
DROP TABLE "SectorMember";
ALTER TABLE "new_SectorMember" RENAME TO "SectorMember";
CREATE UNIQUE INDEX "SectorMember_userId_sectorId_key" ON "SectorMember"("userId", "sectorId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personId" TEXT,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "webAccess" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TEXT,
    "biometricEnabled" BOOLEAN NOT NULL DEFAULT false,
    "memberCode" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "User_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("biometricEnabled", "cpf", "createdAt", "email", "failedLoginCount", "id", "lastLoginAt", "memberCode", "passwordHash", "personId", "status", "updatedAt") SELECT "biometricEnabled", "cpf", "createdAt", "email", "failedLoginCount", "id", "lastLoginAt", "memberCode", "passwordHash", "personId", "status", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_personId_key" ON "User"("personId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_memberCode_key" ON "User"("memberCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BaptismRecord_personId_key" ON "BaptismRecord"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "SectorLeader_sectorId_userId_key" ON "SectorLeader"("sectorId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTag_key_key" ON "EventTag"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CampusSpace_name_key" ON "CampusSpace"("name");
