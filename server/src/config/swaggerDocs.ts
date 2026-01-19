/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         bookingText:
 *           type: string
 *         currency:
 *           type: string
 *         amountDetails:
 *           type: string
 *         zkbReference:
 *           type: string
 *         referenceNumber:
 *           type: string
 *         debitCHF:
 *           type: number
 *         creditCHF:
 *           type: number
 *         valueDate:
 *           type: string
 *           format: date-time
 *         balanceCHF:
 *           type: number
 *         paymentPurpose:
 *           type: string
 *         details:
 *           type: string
 *         type:
 *           type: string
 *           enum: [debit, credit]
 *         amount:
 *           type: number
 *         yearKey:
 *           type: string
 *         monthKey:
 *           type: string
 *         dayKey:
 *           type: string
 *         category:
 *           type: string
 *         categoryManual:
 *           type: boolean
 *
 *     Settings:
 *       type: object
 *       properties:
 *         userFullName:
 *           type: string
 *           description: User full name for savings transfer detection
 *
 *     MonthlySummary:
 *       type: object
 *       properties:
 *         monthKey:
 *           type: string
 *         month:
 *           type: string
 *         income:
 *           type: number
 *         outcome:
 *           type: number
 *         savings:
 *           type: number
 *         savingsIn:
 *           type: number
 *         savingsOut:
 *           type: number
 *         savingsMovement:
 *           type: number
 *         transactionCount:
 *           type: number
 *
 *     DailySummary:
 *       type: object
 *       properties:
 *         dayKey:
 *           type: string
 *         day:
 *           type: string
 *         income:
 *           type: number
 *         outcome:
 *           type: number
 *         savings:
 *           type: number
 *         balance:
 *           type: number
 *         transactionCount:
 *           type: number
 *
 *     CategoryBreakdown:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         total:
 *           type: number
 *         count:
 *           type: number
 *         percentage:
 *           type: number
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userFullName:
 *                 type: string
 *                 description: User full name for savings transfer detection
 *             example:
 *               userFullName: "Yeshenko Dmytro"
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/transactions/upload:
 *   post:
 *     summary: Upload CSV file with transactions
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to upload
 *     responses:
 *       201:
 *         description: Transactions imported
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: number
 *                     skipped:
 *                       type: number
 *                     batchId:
 *                       type: string
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions with pagination and filters
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [debit, credit]
 *         description: Filter by transaction type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in booking text
 *     responses:
 *       200:
 *         description: Paginated transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     pages:
 *                       type: number
 */

/**
 * @swagger
 * /api/transactions/summary/yearly:
 *   get:
 *     summary: Get yearly summary (monthly breakdown)
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Yearly summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MonthlySummary'
 */

/**
 * @swagger
 * /api/transactions/summary/monthly/{year}/{month}:
 *   get:
 *     summary: Get monthly summary (daily breakdown)
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         description: Year (e.g., 2024)
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: Monthly summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DailySummary'
 */

/**
 * @swagger
 * /api/transactions/summary/daily/{year}/{month}/{day}:
 *   get:
 *     summary: Get daily transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: day
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily transactions with summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     dayKey:
 *                       type: string
 *                     income:
 *                       type: number
 *                     outcome:
 *                       type: number
 *                     savings:
 *                       type: number
 *                     balance:
 *                       type: number
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 */

/**
 * @swagger
 * /api/transactions/export:
 *   get:
 *     summary: Export all transactions as CSV
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/transactions/batch/{batchId}:
 *   delete:
 *     summary: Delete a batch of transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Import batch ID
 *     responses:
 *       200:
 *         description: Batch deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deleted:
 *                   type: number
 */

/**
 * @swagger
 * /api/transactions/all:
 *   delete:
 *     summary: Delete all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: All transactions deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deleted:
 *                   type: number
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all available categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /api/categories/rules:
 *   get:
 *     summary: Get category rules with patterns
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category rules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       patterns:
 *                         type: array
 *                         items:
 *                           type: string
 *                       priority:
 *                         type: number
 */

/**
 * @swagger
 * /api/categories/summary/{year}/{month}:
 *   get:
 *     summary: Get category spending summary for a month
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     monthKey:
 *                       type: string
 *                     totalExpenses:
 *                       type: number
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CategoryBreakdown'
 */

/**
 * @swagger
 * /api/categories/transaction/{id}:
 *   patch:
 *     summary: Update transaction category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *             example:
 *               category: "Food"
 *     responses:
 *       200:
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 */

/**
 * @swagger
 * /api/categories/recategorize:
 *   post:
 *     summary: Recategorize all non-manual transactions
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Recategorization complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated:
 *                       type: number
 *                     total:
 *                       type: number
 */
