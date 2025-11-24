import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Caravan } from "./Caravan";
import { Payment } from "./Payment";

@Entity("reservations")
export class Reservation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "caravan_id" })
  caravan_id!: string;

  @ManyToOne(() => Caravan, (caravan) => caravan.reservations)
  caravan!: Caravan;

  @Column({ name: "guest_id" })
  guest_id!: string;

  @ManyToOne(() => User, (user) => user.reservations)
  guest!: User;

  @Column("date")
  start_date!: Date;

  @Column("date")
  end_date!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  total_price!: number;

  @Column({ default: "pending" })
  status!: string; // e.g., 'pending', 'approved', 'awaiting_payment', 'confirmed', 'rejected', 'cancelled'

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(() => Payment, (payment) => payment.reservation, { onDelete: 'CASCADE' })
  payment!: Payment;
}
