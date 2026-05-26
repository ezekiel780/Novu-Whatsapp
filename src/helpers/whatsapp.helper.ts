export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = formatPhoneNumber(phone);
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const buildWhatsAppTemplatePayload = (
  to: string,
  templateName: string,
  parameters: string[],
) => ({
  messaging_product: 'whatsapp',
  to: formatPhoneNumber(to),
  type: 'template',
  template: {
    name: templateName,
    language: { code: 'en_US' },
    components: [
      {
        type: 'body',
        parameters: parameters.map((p) => ({
          type: 'text',
          text: p,
        })),
      },
    ],
  },
});

export const buildWhatsAppTextPayload = (to: string, message: string) => ({
  messaging_product: 'whatsapp',
  to: formatPhoneNumber(to),
  type: 'text',
  text: { body: message },
});
