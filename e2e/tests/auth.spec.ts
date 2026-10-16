import { test, expect } from '@playwright/test'

// Testes de autenticação
test.describe('Login e Cadastro', () => {
  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.locator('input[aria-label="E-mail"]')).toBeVisible()
  })

  test('deve fazer login com credenciais de teste', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'contato@email.com')
    await page.fill('input[type="password"]', 'Senha123!')
    await page.click('button[type="submit"]')
    // Após login, deve redirecionar para a home
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'email@errado.com')
    await page.fill('input[type="password"]', 'senhaerrada')
    await page.click('button[type="submit"]')
    // Deve mostrar mensagem de erro
    await expect(page.locator('text=inválid')).toBeVisible({ timeout: 5000 })
  })

  test('deve exibir a página de cadastro', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible()
  })
})
