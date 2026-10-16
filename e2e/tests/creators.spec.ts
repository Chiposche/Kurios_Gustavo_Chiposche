import { test, expect } from '@playwright/test'

// Testes da página de Criadores
test.describe('Página Criadores', () => {
  test('deve carregar a página com o título Criadores', async ({ page }) => {
    await page.goto('/criadores')
    await expect(page.getByRole('heading', { name: 'Criadores', exact: true })).toBeVisible()
  })

  test('deve exibir cards de criadores com avatar e nome', async ({ page }) => {
    await page.goto('/criadores')
    // Espera os cards carregarem (pelo menos um criador visível)
    await expect(page.locator('text=Luna Nakamoto')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Rafael Pixel')).toBeVisible()
    // Verifica que tem imagem de avatar
    await expect(page.locator('img[alt="Luna Nakamoto"]')).toBeVisible()
  })

  test('deve mostrar estatísticas dos criadores', async ({ page }) => {
    await page.goto('/criadores')
    await expect(page.locator('text=Luna Nakamoto')).toBeVisible({ timeout: 10000 })
    // Verifica que as labels de estatísticas aparecem
    await expect(page.locator('text=NFTs').first()).toBeVisible()
    await expect(page.locator('text=Vendas').first()).toBeVisible()
    await expect(page.locator('text=Seguidores').first()).toBeVisible()
  })

  test('deve mostrar badge de verificado nos criadores verificados', async ({ page }) => {
    await page.goto('/criadores')
    await expect(page.locator('text=Luna Nakamoto')).toBeVisible({ timeout: 10000 })
    // Luna Nakamoto é verificada
    await expect(page.locator('text=Verificado').first()).toBeVisible()
  })

  test('deve ser acessível pelo link da navbar', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // No mobile, abre o menu hamburguer primeiro
      await page.getByLabel('Abrir menu').click()
      await page.getByRole('link', { name: 'Criadores' }).last().click()
    } else {
      await page.locator('nav a:has-text("Criadores")').click()
    }
    await expect(page).toHaveURL(/\/criadores/)
    await expect(page.getByRole('heading', { name: 'Criadores', exact: true })).toBeVisible()
  })
})
