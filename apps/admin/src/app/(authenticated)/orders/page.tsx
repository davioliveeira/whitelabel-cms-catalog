'use client';

import * as React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getRecentOrders } from '@/actions/order.actions'; // Ensure this uses the server action
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OrdersPage() {
    const { storeId } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!storeId) return;
        
        getRecentOrders(storeId)
            .then(data => {
                setOrders(data);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [storeId]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pedidos (WhatsApp)</h1>
                    <p className="text-muted-foreground">Histórico de pedidos lançados manualmente.</p>
                </div>
                <Button onClick={() => router.push('/orders/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Pedido
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead className="text-right">Itens</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">Carregando...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    Nenhum pedido encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const total = order.items.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unitPrice || 0)), 0);
                                
                                return (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
                                    <TableCell>{order.customerPhone}</TableCell>
                                    <TableCell>{order.seller?.name || '-'}</TableCell>
                                    <TableCell className="text-right">{order.items.length}</TableCell>
                                    <TableCell className="text-right font-bold">R$ {total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
