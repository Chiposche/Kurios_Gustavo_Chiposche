import { test, expect } from '@playwright/test'
import { resetScenario, login, addFirstNftToCart } from '../helpers/test'

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

// Testes de sessão expirada
test.describe('Sessão expirada', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
  })

  // Simula a sessão expirando e verifica se o usuário é redirecionado pro login
  test('deve pedir login quando a sessão expira', async ({ page }) => {
    // Faz login normalmente
    await login(page)

    // Remove o token pra simular a sessão expirando
    await page.evaluate(() => sessionStorage.removeItem('auth_token'))

    // Tenta acessar o carrinho (página protegida)
    await page.goto('/cart')

    // Deve mostrar a mensagem pedindo pra fazer login
    await expect(page.getByText('Faça login para ver seu carrinho')).toBeVisible({ timeout: 5000 })
  })
})

// Testes de troca de usuário
test.describe('Troca de usuário', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
  })

  // Verifica se o carrinho de um usuário não aparece pro outro
  test('carrinho deve ser separado entre usuários diferentes', async ({ page }) => {
    // Loga com o primeiro usuário
    await login(page)

    // Adiciona um NFT no carrinho
    await addFirstNftToCart(page)

    // Vai pro carrinho e confere que tem item
    await page.goto('/cart')
    await expect(page.getByText('Resumo da carteira')).toBeVisible({ timeout: 5000 })

    // Faz logout limpando a sessão
    await page.evaluate(() => sessionStorage.removeItem('auth_token'))
    await page.goto('/login')

    // Loga com o segundo usuário
    await page.locator('input[aria-label="E-mail"]').fill('kai@email.com')
    await page.locator('input[aria-label="Senha"]').fill('Senha456!')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL('/', { timeout: 10000 })

    // Vai pro carrinho do segundo usuário
    await page.goto('/cart')

    // O carrinho do segundo usuário deve estar vazio
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible({ timeout: 5000 })
  })
})
