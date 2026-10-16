import { test, expect } from '@playwright/test'

// Testes da página Aprenda
test.describe('Página Aprenda', () => {
  test('deve carregar a página com o título Aprenda', async ({ page }) => {
    await page.goto('/aprenda')
    await expect(page.getByRole('heading', { name: 'Aprenda' })).toBeVisible()
  })

  test('deve exibir cards de artigos com título', async ({ page }) => {
    await page.goto('/aprenda')
    // Espera os artigos carregarem
    await expect(page.locator('text=O que são NFTs?')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Smart Contracts')).toBeVisible()
  })

  test('deve filtrar artigos por categoria', async ({ page }) => {
    await page.goto('/aprenda')
    await expect(page.locator('text=O que são NFTs?')).toBeVisible({ timeout: 10000 })
    // Clica no filtro "Tutorial"
    await page.getByRole('button', { name: 'Tutorial' }).click()
    // Artigos de tutorial devem aparecer
    await expect(page.locator('text=Como criar sua primeira carteira')).toBeVisible({ timeout: 10000 })
    // Artigo de outra categoria não deve aparecer
    await expect(page.locator('text=O que são NFTs? Guia completo')).not.toBeVisible()
  })

  test('deve mostrar o botão Todos ativo por padrão', async ({ page }) => {
    await page.goto('/aprenda')
    // O botão "Todos" deve ter a classe de estilo ativo (bg-[#D4944C])
    const todosButton = page.getByRole('button', { name: 'Todos' })
    await expect(todosButton).toBeVisible()
    await expect(todosButton).toHaveCSS('background-color', 'rgb(212, 148, 76)')
  })

  test('deve ser acessível pelo link da navbar', async ({ page, isMobile }) => {
    await page.goto('/')
    if (isMobile) {
      // No mobile, abre o menu hamburguer primeiro
      await page.getByLabel('Abrir menu').click()
      await page.getByRole('link', { name: 'Aprenda' }).last().click()
    } else {
      await page.locator('nav a:has-text("Aprenda")').click()
    }
    await expect(page).toHaveURL(/\/aprenda/)
    await expect(page.getByRole('heading', { name: 'Aprenda' })).toBeVisible()
  })
})
