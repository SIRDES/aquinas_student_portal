# St. Thomas Aquinas SHS - Students & Admission Portal

A comprehensive web portal for **St. Thomas Aquinas Senior High School**, designed for student management, fresh student admission onboarding, and terminal/mock exam statement of results retrieval.

---

## 🚀 Key Features

### 🎓 1. Student Portal & Dashboard
- **Authentication**: Secure credentials-based login for continuing students using their Student ID and password.
- **Personal Details & Profile**: View enrolled classes, academic programmes, assigned core & elective subjects, and guardian contact details.
- **Class & Subject Management**: Displays curriculum details, subject lists, and year group records.

### 📝 2. Fresh Student Admission Onboarding
- **Placement Verification**: Verify CSSPS placement and BECE index details.
- **Admission Fee Payment**: Integrated Mobile Money (MoMo) payments via Npontu and Paystack.
- **Admission Verification & Code Dispatch**: SMS dispatch of unique admission codes upon verified payment.
- **Personal Records & Biodata Form**: Multi-step student records submission including parental consent, address, and medical/emergency contacts.
- **Document & Prospectus Checklist**: Downloadable forms and admission verification letters.

### 📊 3. Statement of Results & PDF Report Cards
- **Exam Results Verification**: Check scores by term, semester, or batch.
- **Payment Verification**: Verify payment or pay for result checking tokens.
- **Interactive PDF Viewer**: Embedded client-side PDF preview using `@react-pdf/renderer` and PDF.js.
- **One-Click Download**: Export printable, official terminal report cards in PDF format.
- **SMS Results Dispatch**: Automated result delivery directly to parent/guardian phone numbers.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Components**: [Material-UI (MUI v5)](https://mui.com/), [Emotion](https://emotion.sh/)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (JWT session strategy)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose 8](https://mongoosejs.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Yup](https://github.com/jquense/yup)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/), `pdfjs-dist`, `file-saver`
- **Cloud Storage**: [Cloudinary](https://cloudinary.com/) (student profile images)
- **Payments**: Npontu Pay & Paystack
- **SMS Services**: Arkesel & mNotify APIs

---

## 📂 Project Structure

```text
src/
├── app/                      # Next.js App Router pages and API routes
│   ├── (auth)/               # Login and authentication pages
│   ├── (main)/               # Authenticated student portal (profile, results)
│   ├── admission/            # Admission onboarding workflow
│   ├── api/                  # Backend endpoints (NextAuth, payments, verification)
│   ├── check-result/         # Public result checking & FAQ
│   └── report/               # Direct report view with payment token
├── components/               # Reusable UI components, alerts, dialogs & PDFs
├── context/                  # React Context providers (Batches, etc.)
├── models/                   # Mongoose schemas (Student, PlacedStudent, Payments, etc.)
├── types/                    # TypeScript interfaces and NextAuth extensions
└── utils/
    ├── serverActions/        # Next.js Server Actions (students, payments, batches)
    └── services/             # External service wrappers (SMS, Cloudinary, MoMo)
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18.18+ or v20+
- **Yarn**: v4+ (or npm / pnpm)
- **MongoDB**: A running MongoDB database (local or Atlas)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SIRDES/aquinas_student_portal.git
cd aquinas_students_portal
yarn install
```

### 2. Environment Variables Configuration

Create a `.env.development` or `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aquinas

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_JWT_SECRET=your_jwt_secret_key

# Payment Gateways
PAYSTACK_SECRET_KEY=sk_test_xxxxxx
NPOINTU_UID=your_npontu_uid
NPOINTU_PASS=your_npontu_pass
NPOINTU_CALLBACK_URL=http://localhost:3000/api/payment-callback
NPOINTU_ADMISSION_PAYMENT_CALLBACK_URL=http://localhost:3000/api/admission-callback

# SMS Providers
ARKESEL_SMS_API_KEY=your_arkesel_api_key
MNOTIFY_API_KEY=your_mnotify_api_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# App URLs
NEXT_PUBLIC_STUDENT_REPORT_URL=http://localhost:3000/report
```

### 3. Run Development Server

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
yarn build
yarn start
```

---

## 🔒 Security Best Practices

- Always verify that production environment keys and secrets are securely managed in deployment environments (e.g. Vercel, AWS).
- Refer to `security review.md` in the root repository for audited recommendations and access control guidelines.

---

## 📄 License

Private and proprietary. Developed for **St. Thomas Aquinas Senior High School**.
