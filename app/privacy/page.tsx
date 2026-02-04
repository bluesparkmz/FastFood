import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Política de Privacidade | FastFood SkyVenda',
    description: 'Saiba como protegemos seus dados e garantimos sua privacidade na plataforma FastFood SkyVenda.',
};

export default function PrivacyPage() {
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
                    <h1 className="text-lg font-bold text-gray-900">Política de Privacidade</h1>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 space-y-8">

                    {/* Intro Section */}
                    <section className="text-center mb-10">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Sua Privacidade é Prioridade</h2>
                        <p className="text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-MZ')}</p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg shrink-0 mt-1">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Coleta de Informações</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Coletamos informações necessárias para o funcionamento do serviço, incluindo:
                                    <br />• Dados de cadastro (nome, e-mail, telefone)
                                    <br />• <strong>Localização em tempo real:</strong> Coletamos sua localização exata para sugerir os restaurantes e parceiros mais próximos de você (funcionalidade "Perto de Mim") e para calcular taxas e tempo de entrega.
                                    <br />• Histórico de pedidos e preferências
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-emerald-50 rounded-lg shrink-0 mt-1">
                                <Lock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Segurança dos Dados</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Utilizamos criptografia de ponta a ponta e seguimos rigorosos padrões de segurança para proteger suas informações pessoais contra acesso não autorizado.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-purple-50 rounded-lg shrink-0 mt-1">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Uso das Informações</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    Seus dados são utilizados exclusivamente para:
                                    <br />• Processar e entregar seus pedidos
                                    <br />• Melhorar sua experiência no app
                                    <br />• Comunicação sobre status de pedidos e promoções
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-gray-100 pt-8 mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Contato</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Se tiver dúvidas sobre nossa política de privacidade, entre em contato conosco através do suporte.
                        </p>
                        <Link
                            href="/help"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                        >
                            Falar com Suporte
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
