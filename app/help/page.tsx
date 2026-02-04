import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Ajuda e Suporte | FastFood SkyVenda',
    description: 'Precisa de ajuda? Entre em contato com nossa equipe de suporte ou veja as perguntas frequentes.',
};

const FAQS = [
    {
        question: 'Como faço para rastrear meu pedido?',
        answer: 'Você pode acompanhar o status do seu pedido em tempo real na aba "Pedidos" no menu inferior do aplicativo.'
    },
    {
        question: 'Quais métodos de pagamento são aceitos?',
        answer: 'Aceitamos pagamentos via M-Pesa, e-Mola, Cartão de Crédito/Débito e Pagamento na Entrega (Cash).'
    },
    {
        question: 'Como cancelar um pedido?',
        answer: 'Para cancelar um pedido, vá em "Meus Pedidos", selecione o pedido atual e clique em "Cancelar". Note que se o restaurante já tiver iniciado o preparo, pode não ser possível cancelar.'
    },
    {
        question: 'Esqueci minha senha, e agora?',
        answer: 'Na tela de login, clique em "Esqueci minha senha" e siga as instruções enviadas para seu e-mail ou telefone cadastrado.'
    }
];

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link
                        href="/"
                        className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Ajuda e Suporte</h1>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Contact Options */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="https://wa.me/258840000000" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">WhatsApp</h3>
                            <p className="text-sm text-gray-500">Suporte rápido por chat</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-green-500" />
                    </a>

                    <a href="tel:+258840000000" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Phone className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Ligar Agora</h3>
                            <p className="text-sm text-gray-500">Falar com atendente</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-orange-500" />
                    </a>
                </section>

                {/* FAQs */}
                <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-1">
                            <HelpCircle className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-black text-gray-900">Perguntas Frequentes</h2>
                        </div>
                        <p className="text-sm text-gray-500">Respostas para as dúvidas mais comuns</p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {FAQS.map((faq, index) => (
                            <details key={index} className="group p-6 cursor-pointer">
                                <summary className="flex items-center justify-between font-bold text-gray-900 list-none group-hover:text-orange-600 transition-colors">
                                    {faq.question}
                                    <span className="transition-transform group-open:rotate-180">
                                        <ChevronRight className="w-5 h-5 text-gray-400" rotate={90} />
                                    </span>
                                </summary>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed pl-1">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Email Support */}
                <section className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-2">Ainda precisa de ajuda?</p>
                    <a href="mailto:suporte@fastfood.skyvenda.com" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-orange-600 transition-colors">
                        <Mail className="w-4 h-4" />
                        suporte@fastfood.skyvenda.com
                    </a>
                </section>

            </div>
        </main>
    );
}
