import { test, expect } from '@playwright/test'
import { resetScenario, login, addFirstNftToCart } from '../helpers/test'

// Testes do carrinho: item, cupons e remoção
test.describe('Carrinho e cupons', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
    await login(page)
    await addFirstNftToCart(page)
  })

  test('adiciona item, aplica cupom válido e mostra desconto', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('text=Carrinho de NFTs')).toBeVisible()
    await expect(page.locator('text=Resumo da carteira')).toBeVisible()

    // Aplica cupom válido
    await page.fill('input[placeholder="Digite o código..."]', 'KURIO10')
    await page.click('button:has-text("Aplicar")')
    await expect(page.locator('text=Cupom aplicado!')).toBeVisible()
    // O resumo continua com valores coerentes
    await expect(page.locator('text=Subtotal')).toBeVisible()
    await expect(page.locator('text=Desconto do lançamento')).toBeVisible()
  })

  test('exibe erro para cupom inválido', async ({ page }) => {
    await page.goto('/cart')
    await page.fill('input[placeholder="Digite o código..."]', 'NAOEXISTE')
    await page.click('button:has-text("Aplicar")')
    await expect(page.locator('text=Cupom inválido')).toBeVisible()
  })

  test('exibe erro para cupom expirado', async ({ page }) => {
    await page.goto('/cart')
    await page.fill('input[placeholder="Digite o código..."]', 'EXPIRED01')
    await page.click('button:has-text("Aplicar")')
    await expect(page.locator('text=Cupom expirado')).toBeVisible()
  })

  test('remove item e carrinho fica vazio', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.locator('text=Resumo da carteira')).toBeVisible()

    // Remove o item: no mobile não há lixeira - "Diminuir" em qtd 1 remove
    // (no desktop o mesmo comportamento, e a lixeira também existe)
    const trash = page.locator('button[aria-label^="Remover"]').first()
    await trash.click()

    // Confirma no dialog de remoção
    const confirmBtn = page.getByRole('button', { name: 'Remover', exact: true })
    await expect(confirmBtn).toBeVisible({ timeout: 3000 })
    await confirmBtn.click()

    await expect(page.locator('text=Seu carrinho está vazio')).toBeVisible({ timeout: 10000 })
  })
})
