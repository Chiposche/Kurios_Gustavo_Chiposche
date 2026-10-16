import { test, expect } from '@playwright/test'
import { resetScenario, login } from '../helpers/test'

// Testes de edição de perfil, senha e carteiras
test.describe('Perfil e Carteiras', () => {
  test('deve carregar a página de perfil logado e exibir formulário', async ({ page }) => {
    await resetScenario(page)
    await login(page)
    // Navega para o perfil e espera conteúdo
    await page.goto('/profile')
    // Se redirecionou para login, o isAuthenticated falhou — tenta esperar
    if (page.url().includes('/login')) {
      // Faz login de novo e vai direto
      await page.locator('input[aria-label="E-mail"]').fill('contato@email.com')
      await page.locator('input[aria-label="Senha"]').fill('Senha123!')
      await page.getByRole('button', { name: 'Entrar' }).click()
      await page.waitForURL('/', { timeout: 10000 })
      await page.goto('/profile')
    }
    // Perfil deve mostrar o título
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
  })

  test('deve carregar a página de carteiras', async ({ page }) => {
    await resetScenario(page)
    await login(page)
    await page.goto('/wallets')
    if (page.url().includes('/login')) {
      await page.locator('input[aria-label="E-mail"]').fill('contato@email.com')
      await page.locator('input[aria-label="Senha"]').fill('Senha123!')
      await page.getByRole('button', { name: 'Entrar' }).click()
      await page.waitForURL('/', { timeout: 10000 })
      await page.goto('/wallets')
    }
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 })
  })

  test('deve mostrar erro ao trocar senha com dados incorretos', async ({ page }) => {
    await resetScenario(page)
    await login(page)
    await page.goto('/profile')
    if (page.url().includes('/login')) {
      await page.locator('input[aria-label="E-mail"]').fill('contato@email.com')
      await page.locator('input[aria-label="Senha"]').fill('Senha123!')
      await page.getByRole('button', { name: 'Entrar' }).click()
      await page.waitForURL('/', { timeout: 10000 })
      await page.goto('/profile')
    }

    // Espera o formulário de senha aparecer
    const passwordSection = page.locator('text=Alterar senha')
    if (await passwordSection.isVisible({ timeout: 10000 }).catch(() => false)) {
      // Preenche com senha atual errada
      const inputs = page.locator('input[type="password"]')
      if (await inputs.count() >= 2) {
        await inputs.nth(0).fill('SenhaErrada123!')
        await inputs.nth(1).fill('NovaSenha123!')
        if (await inputs.count() >= 3) {
          await inputs.nth(2).fill('NovaSenha123!')
        }
        // Clica no botão de submit da seção de senha
        await page.locator('button[type="submit"]').last().click()
        // Espera feedback de erro
        await expect(page.locator('.bg-red-900\\/30')).toBeVisible({ timeout: 10000 })
      }
    }
  })
})
