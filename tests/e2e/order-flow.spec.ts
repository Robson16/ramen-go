import { expect, test } from '@playwright/test'

test.describe('Critical E2E Flow: Auth and Order', () => {
  test('should block unauthenticated users from accessing the home page', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should login, select ingredients, place order and view success screen', async ({
    page,
  }) => {
    await page.route('**/sessions', async (route) => {
      await route.fulfill({ json: { access_token: 'fake-jwt-token' } })
    })

    await page.route('**/profile', async (route) => {
      await route.fulfill({
        json: {
          user: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      })
    })

    await page.route('**/broths', async (route) => {
      await route.fulfill({
        json: {
          broths: [
            {
              id: '1',
              name: 'Tonkotsu',
              description: 'Rich pork broth',
              price: 10,
              imageActive: 'a.svg',
              imageInactive: 'b.svg',
            },
          ],
        },
      })
    })

    await page.route('**/proteins', async (route) => {
      await route.fulfill({
        json: {
          proteins: [
            {
              id: '2',
              name: 'Chashu',
              description: 'Sliced pork',
              price: 12,
              imageActive: 'c.svg',
              imageInactive: 'd.svg',
            },
          ],
        },
      })
    })

    await page.route('**/orders', async (route) => {
      await route.fulfill({
        json: { order: { id: 'order-123', status: 'PENDING' } },
      })
    })

    await page.route('**/orders/order-123', async (route) => {
      await route.fulfill({
        json: {
          order: {
            id: 'order-123',
            description: 'Tonkotsu and Chashu',
            status: 'PENDING',
          },
        },
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@ramengo.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.getByRole('button', { name: /get in/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Tonkotsu')).toBeVisible()

    await page.locator('label:has-text("Tonkotsu")').click()
    await page.locator('label:has-text("Chashu")').click()

    const submitButton = page.locator('button:has-text("PLACE MY ORDER")')
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    await expect(page).toHaveURL(/.*\/success\/order-123/)
    await expect(page.getByText('Tonkotsu and Chashu')).toBeVisible()
  })
})
