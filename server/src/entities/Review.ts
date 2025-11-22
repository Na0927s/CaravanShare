import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Caravan } from "./Caravan";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "caravan_id" })
  caravan_id!: string;

  @ManyToOne(() => Caravan, (caravan) => caravan.reviews)
  caravan!: Caravan;

  @Column({ name: "guest_id" })
  guest_id!: string;

  @ManyToOne(() => User, (user) => user.reviews)
  guest!: User;

  @Column("int")
  rating!: number; // CHECK constraint (1-5) will be handled by DB or validation layer

  @Column("text", { nullable: true })
  comment!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
