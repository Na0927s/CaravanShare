import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Reservation } from "./Reservation";
import { Review } from "./Review";

@Entity("caravans")
export class Caravan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "host_id" })
  host_id!: string;

  @ManyToOne(() => User, (user) => user.caravans)
  host!: User; // This will link to the User entity

  @Column()
  name!: string;

  @Column("text")
  description!: string;

  @Column()
  location!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price_per_day!: number;

  @Column()
  capacity!: number;

  @Column("jsonb", { default: [] })
  amenities!: string[]; // Storing as JSONB array of strings

  @Column()
  image_url!: string;

  @Column({ default: "available" })
  status!: string; // e.g., 'available', 'reserved', 'maintenance'

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.caravan)
  reservations!: Reservation[];

  @OneToMany(() => Review, (review) => review.caravan)
  reviews!: Review[];
}
