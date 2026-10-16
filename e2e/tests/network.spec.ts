import { test, expect } from '@playwright/test'
import { resetScenario } from '../helpers/test'

// Cenários de condição de rede
test.describe('Cenários de condição de rede', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
  })

  test('modo lento mostra skeletons e depois carrega os NFTs', async ({ page }) => {
    await page.selectOption('#network-mode', 'slow')

    await page.goto('/marketplace')
    await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 3000 })
    await expect(page.locator('a[href*="/nft/"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('erro 500 exibe feedback e recupera após nova tentativa', async ({ page }) => {
    await page.selectOption('#network-mode', 'error')

    await page.goto('/marketplace')
    await expect(page.locator('text=Erro ao carregar NFTs')).toBeVisible({ timeout: 10000 })

    // Volta ao normal e tenta de novo pelo botão da própria tela
    await page.selectOption('#network-mode', 'normal')
    await page.getByRole('button', { name: 'Recarregar' }).click()
    await expect(page.locator('a[href*="/nft/"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('sem conexão exibe falha de carregamento', async ({ page }) => {
    await page.selectOption('#network-mode', 'offline')

    await page.goto('/marketplace')
    await expect(page.locator('text=Erro ao carregar NFTs')).toBeVisible({ timeout: 10000 })
  })

  test('resetar cenário volta a rede ao normal', async ({ page }) => {
    await page.selectOption('#network-mode', 'error')

    // O botão de reset do footer zera o modo junto com o banco
    await page.getByRole('button', { name: 'Resetar cenário de teste' }).click()
    await expect(page.locator('#network-mode')).toHaveValue('normal', { timeout: 10000 })

    await page.goto('/marketplace')
    await expect(page.locator('a[href*="/nft/"]').first()).toBeVisible({ timeout: 10000 })
  })
})
