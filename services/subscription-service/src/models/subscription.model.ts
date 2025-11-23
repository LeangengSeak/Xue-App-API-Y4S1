import { Schema, model, Document, Types } from "mongoose";

/**
 * Subscription service models
 * - Plan: available plans (monthly, 6months, annual)
 * - Subscription: user subscription record (mirrors provider state)
 * - Invoice: minimal invoice record
 */

export interface IPlan extends Document {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  interval: "month" | "months" | "year";
  intervalCount: number;
  features?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    priceCents: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    interval: {
      type: String,
      enum: ["month", "months", "year"],
      required: true,
    },
    intervalCount: { type: Number, required: true },
    features: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Plan = model<IPlan>("Plan", PlanSchema);

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  providerSubscriptionId?: string;
  status: "active" | "past_due" | "canceled" | "trialing" | "inactive";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },
    providerSubscriptionId: { type: String },
    status: { type: String, required: true, default: "inactive" },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1 });
export const Subscription = model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);

export interface IInvoice extends Document {
  subscriptionId?: Types.ObjectId;
  userId: Types.ObjectId;
  providerInvoiceId?: string;
  amountCents?: number;
  currency?: string;
  paid?: boolean;
  issuedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    subscriptionId: { type: Schema.Types.ObjectId },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    providerInvoiceId: { type: String },
    amountCents: { type: Number },
    currency: { type: String },
    paid: { type: Boolean, default: false },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>("Invoice", InvoiceSchema);
