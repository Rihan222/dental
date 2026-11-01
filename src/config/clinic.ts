export const clinic = {
  name: 'Noor Dental Atelier',
  arabicName: 'نور — أتيليه طب الأسنان',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  workingHours: '',
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
} as const;

export const whatsappUrl = (message: string) =>
  `https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
