import type {Cart, Order, OrderService} from '@/lib/types'
import {EmptyCartError} from '@/lib/types'

import {createOrder, getOrderByNumber} from '../sanity/queries'

class OrderServiceImpl implements OrderService {
  async createOrder(cart: Cart): Promise<Order> {
    // Validate cart is not empty
    if (cart.lineItems.length === 0) {
      throw new EmptyCartError()
    }

    // Generate order number
    const orderNumber = this.generateOrderNumber()

    // Transform cart to order format
    const orderData = {
      orderNumber,
      lineItems: cart.lineItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sizeKey: item.sizeKey,
        sizeName: item.sizeName,
        grams: item.grams,
        grind: item.grind,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        lineTotal: item.lineTotal,
        itemType: (item.itemType || 'product') as 'product' | 'bundle' | 'subscription',
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      total: cart.total,
      appliedPromotion: cart.appliedPromotion
        ? {
            code: cart.appliedPromotion.code,
            name: cart.appliedPromotion.name,
            discountType: cart.appliedPromotion.discountType,
            discountValue: cart.appliedPromotion.discountValue,
          }
        : undefined,
    }

    // Create order in Sanity
    const createdOrder = (await createOrder(orderData)) as {
      _id: string
      orderNumber: string
      lineItems: Array<{
        id: string
        productId: string
        productName: string
        sizeKey: string
        sizeName: string
        grams: number
        grind: string
        quantity: number
        pricePerUnit: number
        lineTotal: number
        itemType: 'product' | 'bundle' | 'subscription'
      }>
      subtotal: number
      discount: number
      total: number
      appliedPromotion?: {
        code?: string
        name: string
        discountType: string
        discountValue: number
      }
      createdAt: string
      isTestOrder: boolean
    }

    return {
      _id: createdOrder._id,
      _type: 'order',
      orderNumber: createdOrder.orderNumber,
      lineItems: createdOrder.lineItems,
      subtotal: createdOrder.subtotal,
      discount: createdOrder.discount,
      total: createdOrder.total,
      appliedPromotion: createdOrder.appliedPromotion,
      createdAt: new Date(createdOrder.createdAt),
      isTestOrder: createdOrder.isTestOrder,
    }
  }

  async getOrder(orderNumber: string): Promise<Order | null> {
    const order = await getOrderByNumber(orderNumber)

    if (!order) {
      return null
    }

    return order as Order
  }

  generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `BT-${timestamp}-${random}`
  }
}

export const orderService = new OrderServiceImpl()
