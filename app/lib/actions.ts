'use server';
// By adding the 'use server', you mark all the exported
// functions within the file as server functions. These
// server functions can then be imported into Client and
// Server components, making them extremely versatile.

import { z } from 'zod';
// we'll use Zod, a TypeScript-first validation library that
// can simplify this task for you.

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });


export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
      // Test it out:
      console.log(typeof amount);
      const amountInCents = amount * 100;
      const date = new Date().toISOString().split('T')[0];

      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
      revalidatePath('/dashboard/invoices');
      // this one will disable the cache and refresh the data.
      // Once the database has been updated, the /dashboard/invoices path
      // will be revalidated, and fresh data will be fetched from the
      // server.
      redirect('/dashboard/invoices');
      // At this point, you also want to redirect the user back to the
      // /dashboard/invoices page. You can do this with the redirect
      // function from Next.js.
    }

// Use Zod to update the expected types
const UpdateInvoice = InvoiceSchema.omit({ date: true, id: true });
 
// the action to overwrite the invoice data from the db.
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
 
export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}