'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createOrder } from '@/actions/order.actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ShoppingBag, Save, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock types until we have proper SWR/Query for products/users
interface SimpleProduct {
    id: string;
    name: string;
    salePrice: number;
    stockQuantity: number;
}

interface SimpleUser {
    id: string;
    name: string;
    email: string;
}

export default function NewOrderPage() {
    const router = useRouter();
    const { storeId, user } = useAuth();
    
    const [isLoading, setIsLoading] = React.useState(false);
    
    // Form State
    const [customerName, setCustomerName] = React.useState('');
    const [customerPhone, setCustomerPhone] = React.useState('');
    const [sellerId, setSellerId] = React.useState('');
    
    // Line Item State
    const [selectedProductId, setSelectedProductId] = React.useState('');
    const [qty, setQty] = React.useState(1);
    
    // Cart State
    const [orderItems, setOrderItems] = React.useState<Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
    }>>([]);

    // Data State
    const [products, setProducts] = React.useState<SimpleProduct[]>([]);
    const [users, setUsers] = React.useState<SimpleUser[]>([]);

    // Load Data
    React.useEffect(() => {
        if (!storeId) return;

        // Fetch Products
        fetch(`/api/products?limit=100`) // Simplified fetch
            .then(res => res.json())
            .then(data => {
                if (data.products) setProducts(data.products);
            })
            .catch(console.error);

        // Fetch Users (Sellers) - Assuming an API exists or we mock for now
        // As we don't have a guaranteed users API in the prompt context but 'User' model exists.
        // I will assume I can fetch users. If not, I'll default to current user.
        // Let's rely on a hypothetical /api/users endpoint or just current user.
        // For now, let's hardcode the current user if API fails?
        // Actually, let's try to fetch /api/users if we are Admin. 
        // If Attendant, maybe we can only select ourselves?
        // The spec says "Vendedor responsável (obrigatório; selecionar de uma lista)".
        // Fetch Users (Sellers)
        fetch('/api/users')
            .then(res => {
                 if(res.ok) return res.json();
                 throw new Error('Failed to fetch users');
            })
            .then(data => {
                // API now returns array directly, not { users: [...] }
                if(Array.isArray(data)) {
                    setUsers(data);
                } else {
                    // Fallback to current user
                    if(user) setUsers([{ id: user.id || '', name: user.name || 'Current User', email: user.email || '' }]);
                }
            })
            .catch((err) => {
                 console.error('Failed to fetch users:', err);
                 // Fallback to current user
                 if(user) setUsers([{ id: user.id || '', name: user.name || 'Current User', email: user.email || '' }]);
            });
    }, [storeId, user]);

    // Handlers
    const handleAddItem = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        setOrderItems(prev => {
            const existing = prev.find(item => item.productId === selectedProductId);
            if (existing) {
                return prev.map(item => 
                    item.productId === selectedProductId 
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                productName: product.name,
                quantity: qty,
                unitPrice: Number(product.salePrice)
            }];
        });

        // Reset item input
        setSelectedProductId('');
        setQty(1);
    };

    const handleRemoveItem = (idx: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSaveOrder = async () => {
        if (!storeId) return;
        if (!customerName || !customerPhone || !sellerId || orderItems.length === 0) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createOrder(storeId, {
                customerName,
                customerPhone,
                sellerId,
                items: orderItems
            });

            if (result.success) {
                toast.success("Pedido registrado com sucesso!");
                router.push('/orders');
            } else {
                toast.error("Erro ao salvar pedido");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Total
    const totalOrder = orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const selectedProduct = products.find(p => p.id === selectedProductId);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Pedido (WhatsApp)</h1>
                    <p className="text-muted-foreground">Registre uma venda realizada manualmente.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Customer & Seller Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Cliente & Vendedor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Cliente *</Label>
                                <Input 
                                    placeholder="Ex: Maria Silva"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone (WhatsApp) *</Label>
                                <Input 
                                    placeholder="(11) 99999-9999"
                                    value={customerPhone}
                                    onChange={e => {
                                        // Simple mask logic or just text
                                        setCustomerPhone(e.target.value);
                                    }}
                                />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label>Vendedor Responsável *</Label>
                                <Select value={sellerId} onValueChange={setSellerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Items & Cart */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5" />
                                Itens do Pedido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add Item Form */}
                            <div className="flex flex-col md:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border">
                                <div className="space-y-2 flex-1 w-full">
                                    <Label>Produto</Label>
                                     <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Buscar produto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id} disabled={p.stockQuantity <= 0 && false /* Allow negative? Spec says permit negative warning */}>
                                                    <span className="flex justify-between w-full gap-4">
                                                        <span>{p.name}</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            (Estoque: {p.stockQuantity}) - R$ {Number(p.salePrice).toFixed(2)}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                            {products.length === 0 && <div className="p-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 w-24">
                                    <Label>Qtd</Label>
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        value={qty} 
                                        onChange={e => setQty(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                <Button onClick={handleAddItem} disabled={!selectedProductId}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar
                                </Button>
                            </div>
                            
                            {/* Stock Warning */}
                            {selectedProduct && selectedProduct.stockQuantity < qty && (
                                <div className="text-amber-600 text-sm font-medium">
                                    ⚠️ Atenção: Estoque atual ({selectedProduct.stockQuantity}) é menor que a quantidade desejada.
                                </div>
                            )}

                            {/* Cart Table */}
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead className="text-right">Qtd</TableHead>
                                            <TableHead className="text-right">Unitário</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                                    Nenhum item adicionado
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orderItems.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{item.productName}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {/* Footer Totals */}
                            <div className="flex justify-between items-center pt-4">
                                <div className="text-sm text-muted-foreground">
                                    {orderItems.length} itens no pedido
                                </div>
                                <div className="text-2xl font-bold">
                                    Total: R$ {totalOrder.toFixed(2)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancelar</Button>
                        <Button size="lg" onClick={handleSaveOrder} disabled={isLoading || orderItems.length === 0}>
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Salvando...' : 'Finalizar Lançamento'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
