-- CreateTable
CREATE TABLE "Organization" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "state" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "signatureUrl" TEXT,
    "orgType" TEXT NOT NULL DEFAULT 'BUSINESS'
);

-- CreateTable
CREATE TABLE "Invoice" (
    "invoiceId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNumber" INTEGER NOT NULL,
    "orgId" INTEGER NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" INTEGER NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "gstAmount" DECIMAL NOT NULL,
    "netAmount" DECIMAL NOT NULL,
    CONSTRAINT "Invoice_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "gst" DECIMAL NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "invoiceItemId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "itemTotalAmount" DECIMAL NOT NULL,
    "itemGstAmount" DECIMAL NOT NULL,
    "itemIgstAmount" DECIMAL NOT NULL,
    "itemCgstAmount" DECIMAL NOT NULL,
    "itemSgstAmount" DECIMAL NOT NULL,
    "itemNetAmount" DECIMAL NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("invoiceId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_itemId_idx" ON "InvoiceItem"("itemId");
