// Единая система тарифных планов
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Базовый',
    price: 'Бесплатно',
    monthlyPrice: 0,
    description: 'Для личного использования',
    features: [
      '1 ГБ хранилища',
      '1 почтовый адрес',
      'Базовая защита от спама',
      'Мобильное приложение'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Профессиональный',
    price: '499₽/мес',
    monthlyPrice: 499,
    description: 'Для бизнеса и команд',
    features: [
      '25 ГБ хранилища',
      '5 почтовых адресов',
      'Расширенная защита',
      'Календарь и задачи',
      'Приоритетная поддержка'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Корпоративный',
    price: '1499₽/мес',
    monthlyPrice: 1499,
    description: 'Для больших команд',
    features: [
      'Безлимитное хранилище',
      'Безлимитные адреса',
      'Корпоративная защита',
      'Административная панель',
      '24/7 поддержка'
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanDisplayName(planId: string): string {
  const plan = PLANS[planId as PlanId];
  return plan ? plan.name : 'Неизвестный';
}

export function getPlanPrice(planId: string): string {
  const plan = PLANS[planId as PlanId];
  return plan ? plan.price : 'Неизвестно';
}