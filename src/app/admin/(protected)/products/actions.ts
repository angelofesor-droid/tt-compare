"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProductStatus } from "@/generated/prisma/enums";
import { createProduct, duplicateProduct, setProductStatus, updateProduct } from "@/lib/services/product.service";
import type { CreateProductInput } from "@/lib/services/product.service";

export type FormState = { error?: string; success?: boolean };

function extractProductInput(formData: FormData): CreateProductInput {
  // Campos básicos
  const name = String(formData.get("name") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "DRAFT") as ProductStatus;
  const featured = formData.get("featured") === "on";
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;
  const explicitSlug = String(formData.get("slug") ?? "").trim() || undefined;

  // Imágenes
  const images = Array.from({ length: 8 }, (_, i) => {
    const url = String(formData.get(`image_url_${i}`) ?? "").trim();
    if (!url) return null;
    return {
      url,
      alt: String(formData.get(`image_alt_${i}`) ?? "").trim() || null,
      source: String(formData.get(`image_source_${i}`) ?? "").trim() || null,
      sourceUrl: String(formData.get(`image_sourceUrl_${i}`) ?? "").trim() || null,
      kind: "PRODUCT" as const,
      sortOrder: 0,
      isPrimary: formData.get(`image_primary_${i}`) === "on" || i === 0,
    };
  }).filter((img): img is NonNullable<typeof img> => img !== null);

  // Fuentes
  const sources = Array.from({ length: 4 }, (_, i) => {
    const url = String(formData.get(`source_url_${i}`) ?? "").trim();
    const nameSrc = String(formData.get(`source_name_${i}`) ?? "").trim();
    if (!url) return null;
    return { url, name: nameSrc || url, kind: "MANUFACTURER" as const };
  }).filter((s): s is NonNullable<typeof s> => s !== null);

  // Atributos dinámicos (solo los que tengan valor)
  const attributes: { key: string; value: string; unit: string | null; scale: string | null; source: string | null }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("attr_")) continue;
    const rawValue = String(value ?? "").trim();
    if (!rawValue) continue;
    const attrKey = key.slice(5);
    attributes.push({
      key: attrKey,
      value: rawValue,
      unit: String(formData.get(`attr_unit_${attrKey}`) ?? "").trim() || null,
      scale: String(formData.get(`attr_scale_${attrKey}`) ?? "").trim() || null,
      source: String(formData.get(`attr_source_${attrKey}`) ?? "").trim() || null,
    });
  }

  // Pros / contras
  const pros: string[] = [];
  const cons: string[] = [];
  for (const [key, value] of formData.entries()) {
    const text = String(value ?? "").trim();
    if (!text) continue;
    if (key.startsWith("pro_")) pros.push(text);
    if (key.startsWith("con_")) cons.push(text);
  }

  // Precio (opcional)
  const priceAmount = Number(formData.get("price_amount") ?? 0);
  const price = priceAmount > 0
    ? {
        amount: priceAmount,
        currency: String(formData.get("price_currency") ?? "CLP") || "CLP",
        source: String(formData.get("price_source") ?? "").trim() || null,
      }
    : undefined;

  return {
    name,
    slug: explicitSlug,
    brandId,
    categoryId,
    summary,
    description,
    status,
    featured,
    seoTitle,
    seoDescription,
    images,
    sources,
    attributes,
    pros,
    cons,
    price,
  };
}

export async function createProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const input = extractProductInput(formData);
    const product = await createProduct(input);
    revalidatePath("/");
    revalidatePath("/rubbers");
    revalidatePath("/blades");
    revalidatePath("/tables");
    redirect(`/admin/products/${product.id}/edit?created=1`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear el producto." };
  }
}

export async function updateProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  try {
    const input = extractProductInput(formData);
    const product = await updateProduct(id, input);
    revalidatePath("/");
    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/admin/products/${product.id}/edit`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar el producto." };
  }
}

export async function setStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ProductStatus;
  try {
    await setProductStatus(id, status);
  } catch {
    return;
  }
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/rubbers");
  revalidatePath("/blades");
  revalidatePath("/tables");
}

export async function duplicateAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  try {
    const copy = await duplicateProduct(id);
    redirect(`/admin/products/${copy.id}/edit?duplicated=1`);
  } catch {
    return;
  }
}
