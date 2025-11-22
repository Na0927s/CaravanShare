import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Reservation } from "./Reservation";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "reservation_id", unique: true })
  reservation_id!: string;

  @OneToOne(() => Reservation, (reservation) => reservation.payment)
  @JoinColumn({ name: "reservation_id" })
  reservation!: Reservation;

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  payment_date!: Date;

  @Column({ default: "pending" })
  status!: string; // e.g., 'pending', 'completed', 'failed'

  @Column({ unique: true, nullable: true })
  transaction_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
